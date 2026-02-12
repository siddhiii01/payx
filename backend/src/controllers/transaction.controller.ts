import { prisma } from "@db/prisma.js";
import { AppError } from "@utils/AppError.js";
import { asyncHandler } from "@utils/asyncHandler.js";
import type { Request, Response } from "express";

export class TransactionController {

    static getUserTransactions = asyncHandler(async (req: Request, res: Response) => {
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

    /**
   * GET /api/transaction/latest
   * Returns the most recent transaction for the authenticated user
   * Used by /payment-status to show success/failure confirmation
   */
  static getLatestUserTransaction = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    // Find the most recent ledger entry for this user
    const latestLedger = await prisma.transactionLedger.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" }, // newest first
      select: {
        id: true,
        amount: true,
        direction: true,
        transactionType: true,
        createdAt: true,
        onRampTx: {
          select: {
            provider: true,
            status: true,
          },
        },
        p2pTransfer: {
          select: {
            senderId: true,
            receiverId: true,
            status: true,
            sender: { select: { name: true } },
            receiver: { select: { name: true } },
          },
        },
      },
    });

    if (!latestLedger) {
      return res.status(200).json({
        success: true,
        data: null, // no recent transaction
      });
    }

    // Format response
    let responseData: any = {
      amount: latestLedger.amount / 100, // paise → rupees
      date: latestLedger.createdAt.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
      statusText:
        latestLedger.onRampTx?.status === "Success" ||
        latestLedger.p2pTransfer?.status === "COMPLETED"
          ? "Successful"
          : "Failed",
    };

    if (latestLedger.transactionType === "ONRAMP") {
      responseData = {
        ...responseData,
        type: "onramp",
        method: `Bank • ${latestLedger.onRampTx?.provider || "Unknown"}`,
      };
    } else if (latestLedger.transactionType === "P2P_TRANSFER") {
      const isSent = latestLedger.p2pTransfer?.senderId === userId;

      responseData = {
        ...responseData,
        type: "p2p",
        method: "Wallet Transfer",
        direction: isSent ? "sent" : "received",
        counterparty: isSent
          ? latestLedger.p2pTransfer?.receiver?.name
          : latestLedger.p2pTransfer?.sender?.name,
      };
    }

    return res.status(200).json({
      success: true,
      data: responseData,
    });
  });

}