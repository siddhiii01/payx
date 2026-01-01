import type {Request, Response} from "express";
import { prisma } from "@db/prisma.js";
import {z} from "zod";

export const paymentCallbackSchema = z.object({
    token: z.string().min(1),
    userId: z.number(),
    amount: z.number().min(1).max(10000),
    status: z.enum(['Success', 'Failed'])
});

export class Webhook {
    static webhookhanlder = async (req: Request, res: Response) => {

        //received from bank
        //console.log("received from bank", req.body)
        const parsed = paymentCallbackSchema.safeParse(req.body);
        if(!parsed.success){
            return res.status(400).json({
                message: "Invalid request body",
                errors: parsed.error.flatten(),
            });
        }
        const { token, userId, amount, status } = parsed.data;

        try {
            //atomicity  -> either all query should happen or none
            await prisma.$transaction( async (tx) => {
                //finding the tx
                const onRampTx = await tx.onRampTx.findUnique({
                    where: {token}
                });
                if(!onRampTx){
                    throw new Error("Transaction not found");
                }

                //  userId must match
                if (onRampTx.userId !== userId) {
                    throw new Error("User ID mismatch");
                }

                //preventing idempotency (replay attacks) -> if already final state do nothing
                //Checking Current Status to Prevent Duplicates
                if(onRampTx.status === "Success" || onRampTx.status === "Failed"){
                    console.log("Webhook ignored: already processed", token);
                    return;
                }

                //handling failed tx
                if(status === "Failed"){
                    await tx.onRampTx.update({
                        where: {token},
                        data: {
                            status: 'Failed'
                        }
                    })
                    console.log('Transaction failed');
                    return;
                }

                //handling Successs Tx : -> update balance + onramp
                await tx.balance.update({
                    where: {
                        userId: onRampTx.userId
                    },
                    data: {
                        amount: {
                            increment: onRampTx.amount
                        }
                    }
                });

                await tx.onRampTx.update({
                    where: {token},
                    data: {
                        status: 'Success'
                    }
                });
                console.log(`Wallet credited: +${onRampTx.amount} for user ${userId}`);

                //transaction has succeeded -> acknowledging the bank
                return res.status(200).json({ message: "Webhook processed" });
            });

        } catch(error: any){
            console.error("Webhook error:", error.message);
            return res.status(500).json({ message: "Internal error" });
        }

        

        
         
        
    }
}