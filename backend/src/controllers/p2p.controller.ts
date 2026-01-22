import { prisma } from "@db/prisma.js";
import type {Request, Response} from "express";
import z from "zod";
import { TransactionIntent } from '../utils/transactionIntent.js';
import { asyncHanlder } from '../utils/asyncHandler.js';
import { AppError } from "@utils/AppError.js";
import { evaluteIntent } from "@utils/decision_engine.util.js";


const paymentSchema = z.object({
    amount: z.number().min(1).max(10000),
    phoneNumber: z.string().trim()
});

export class p2p {
    //request to create a P2P transfer intent
    static walletTransfer = asyncHanlder(async (req: Request, res: Response) => {
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

        //Fetching sender and it's wallet balance:
        const sender = await prisma.user.findUnique({
            where: {id : senderId},
            select: {
                id: true,
                phoneNumber: true,
                balances: {
                    select: {
                        amount:true
                    }
                }
            }
        });
        // console.log("sender info from db", sender);
        if(!sender || !sender.balances){
            throw new AppError("Sender wallet not initialized" , 400);
        }
        if(sender.balances.amount < amount){
            throw new AppError("Insufficient Balance", 400)
        }

        //fetching receiver and it's wallet balance
        const receiver = await prisma.user.findUnique({
            where: {phoneNumber},
            select: {
                id: true,
                phoneNumber: true
            }
        });
        // console.log("receiver info from db", receiver);
        if(!receiver){
            throw new AppError("Reciver not found", 404);
        }
        
        //no self transfer
        if(sender.id == receiver.id){
            throw new AppError("Cannot send money to yourself", 400);
        }

        //creating transaction intent
        const intent = await TransactionIntent.createTransactionIntent(
            senderId,
            receiver.id,
            amount
        );
            
        res.status(202).json({
            intentId: intent.id,
            status: intent.status,
            message: "Transacrion pending approval"
        });

        evaluteIntent(intent.id);
       
    })
}