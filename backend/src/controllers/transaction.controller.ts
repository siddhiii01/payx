import { prisma } from "@db/prisma.js";
import { AppError } from "@utils/AppError.js";
import { asyncHanlder } from "@utils/asyncHandler.js";
import type { Request, Response } from "express";

export class TransactionController {

    static getUserTransactions = asyncHanlder(async (req: Request, res: Response) => {
        const userId = (req as any).userId;

        if (!userId) {
            throw new AppError("Unauthorized", 401);
        }

        // Optional: pagination (very useful for real apps)
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const transactions = await prisma.transactionLedger.findMany({
            where: {userId},
            orderBy: {createdAt: "desc"},
            skip,
            take: limit,
            select: {
                id: true,
                amount: true,
                direction: true, // DEBIT or CREDIT
                transactionType: true, //ONRAMP or P2P_TRANSFER
                createdAt: true,

                onRampTx: {
                    select: {
                        provider: true,
                        token: true,
                        status: true
                    },
                },
                p2pTransfer: {
                    select: {
                        sender: {select: {name: true, phoneNumber: true}},
                        receiver: {select: {name: true, phoneNumber: true}},
                        status: true,
                    }
                }
            }
        });

        // Format for frontend (convert paise → rupees, add description)
        const formatted = transactions.map((tx) => {
            const amountInRupees = (tx.amount / 100).toFixed(2);

            let description = "";
            let counterparty = "";

            if(tx.transactionType === "ONRAMP"){
                description = `Added via ${tx.onRampTx?.provider || "Bank"}`
            } else if (tx.transactionType === "P2P_TRANSFER") {
                if (tx.direction === "DEBIT") {
                    description = "Sent to";
                    counterparty = tx.p2pTransfer?.receiver?.name || "Unknown";
                } else {
                    description = "Received from";
                    counterparty = tx.p2pTransfer?.sender?.name || "Unknown";
                }
            }

            return {
                id: tx.id,
                type: tx.transactionType,
                direction: tx.direction,
                amount: Number(amountInRupees),
                date: tx.createdAt.toISOString(),
                description,
                counterparty,
                status: tx.onRampTx?.status || tx.p2pTransfer?.status || "COMPLETED",
            };
            
        })

        const total = await prisma.transactionLedger.count({ where: { userId } });
        return res.status(200).json({
            success: true,
            data: formatted,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    });
}