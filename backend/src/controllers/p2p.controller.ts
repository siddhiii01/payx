import { prisma } from "@db/prisma.js";
import type {Request, Response} from "express";
import z from "zod";
import { TransactionIntent } from '../utils/transactionIntent.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from "@utils/AppError.js";
import { evaluateRisk} from "@utils/decision_engine.util.js";


const paymentSchema = z.object({
    amount: z.number().min(1).max(10000),
    phoneNumber: z.string().trim()
});

export class p2p {
    //request to create a P2P transfer intent
    static walletTransfer = asyncHandler(async (req: Request, res: Response) => {
        //validating input request
        const parsed = paymentSchema.safeParse(req.body);
        if(!parsed.success){
            throw new AppError("Zod validation failed", 400, parsed.error.flatten().fieldErrors);
        }
        const {phoneNumber, amount} = parsed.data;

        //authenticate sender
        const senderId = (req as any).userId;
        if(!senderId){
            throw new AppError("Unauthoried", 401);
        }
       
        // 2. Atomic transaction — all or nothing
        const result = await prisma.$transaction(async (tx) => {
            // Fetch sender + balance
            const sender = await tx.user.findUnique({
                where: { id: senderId },
                include: {
                balances: true,
                },
            });

            if (!sender || !sender.balances) {
                throw new AppError("Sender wallet not found or not initialized", 400);
            }

            if (sender.balances.amount < amount) {
                throw new AppError("Insufficient balance", 400);
            }

            // Fetch receiver
            const receiver = await tx.user.findUnique({
                where: { phoneNumber },
                select: { id: true, phoneNumber: true },
            });

            if (!receiver) {
                throw new AppError("Receiver not found", 404);
            }

            if (sender.id === receiver.id) {
                throw new AppError("Cannot send money to yourself", 400);
            }

            // Create P2P transfer record (PENDING → COMPLETED)
            const p2pTransfer = await tx.p2PTransfer.create({
                data: {
                senderId: sender.id,
                receiverId: receiver.id,
                amount, // already in paise? → make sure frontend sends paise or multiply *100
                status: "COMPLETED", // since we're doing it immediately
                },
            });

            // Lock & move money (atomic inside transaction)
            // Debit sender (available → locked → then unlock after success)
            await tx.balance.update({
                where: { userId: sender.id },
                data: {
                amount: { decrement: amount },
                locked: { increment: amount },
                },
            });

            // Credit receiver
            await tx.balance.update({
                where: { userId: receiver.id },
                data: {
                amount: { increment: amount },
                },
            });

            // Unlock sender's locked amount (since tx succeeded)
            await tx.balance.update({
                where: { userId: sender.id },
                data: {
                locked: { decrement: amount },
                },
            });

            // Create ledger entries (both sides)
            await tx.transactionLedger.createMany({
                data: [
                {
                    userId: sender.id,
                    transactionType: "P2P_TRANSFER",
                    direction: "DEBIT",
                    amount,
                    p2pTransferLedger: p2pTransfer.id,
                },
                {
                    userId: receiver.id,
                    transactionType: "P2P_TRANSFER",
                    direction: "CREDIT",
                    amount,
                    p2pTransferLedger: p2pTransfer.id,
                },
                ],
            });

            // // Final update — mark transfer as completed (already set, but explicit)
            // await tx.p2PTransfer.update({
            //     where: { id: p2pTransfer.id },
            //     data: { status: "COMPLETED" },
            // });

            return {
                transactionId: p2pTransfer.id,
                status: "COMPLETED",
                amount,
                receiverPhoneNumber: receiver.phoneNumber,
                type: "P2P",
                timestamp: new Date().toISOString(),
            }; 
        }, 
        {
        timeout: 15000,   // 15 seconds - should be enough
        maxWait: 10000,   // optional: wait up to 10s to acquire transaction
      }
    );

        // If we reach here → transaction succeeded
        return res.status(200).json({
        success: true,
        message: "Transfer successful",
        data: result,
        });
        
       
    });
}


        