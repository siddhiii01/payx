import type {Request, Response} from "express";
import {initiateOnRampSchema} from "@validations/onramp.schema.js";
import { prisma } from "@db/prisma.js";
import { appConfig } from "@config/app.config.js";
import crypto from "crypto";



export class OnRampController {

    //here we are adiing money to our paytm wallet -> webhook
    static  initiateOnRampTx = async (req:Request, res:Response) =>{

        try {

            //users sends amt and prvodier and zod validates it -> we are protecting API from garbage data
            const result = initiateOnRampSchema.safeParse(req.body);
            if(!result.success){
                return res.json({
                    error: result.error
                })
            }

            //here we are getting logged-in userId which attached by auth middkewaree 
            //and this Id is same as User id field 
            const userId = (req as any).userId;
            //console.log(userId)

            //bank simulator will use this token to tell you which token the user paid for 
            const token = crypto.randomBytes(32).toString('hex');
            console.log(`TOKEN GENERATED FOR USER: ${token}`);

            //created new pending transaction in db
            const transaction = await prisma.onRampTx.create({
                data: {
                    amount: result.data.amount,
                    provider: result.data.provider,
                    userId,
                    token
                }
            }) //-> this tx is pending , identified by token,  -> linked to user

            //redirecting to bank simulator payment gateway URL
            //this is like mocking a bank payment page
            //so here token is used to indentify the transaction
            //bank will read taht token -> show "pay" page -> and later call you callback API
            const redirectUrl = `http://${appConfig.host}:${appConfig.port}/bank-simulator/payment?token=${token}`


            // console.log(tx);
            return res.status(200).json({
                success: true,
                message: "Transaction initiated",
                data: {
                    token: transaction.token,
                    redirectUrl,
                    amount: transaction.amount,
                    provider: transaction.provider
                }
            })
        } catch(error){
            console.log(error)
            res.status(500).json({message: "Failed to initiate transaction",});
        }
        

    }


}
  