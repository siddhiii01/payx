import { prisma } from "@db/prisma.js";
import axios from "axios";
import type { Request, Response } from "express";
import z from "zod";

const PROVIDERS = ["HDFC", "AXIS", "SBI"] as const;

const moneySchema = z.object({
    amount : z.number().min(1).max(10000),
    provider: z.enum(PROVIDERS),
});

export const onramptx = async (req: Request, res: Response) => {
    const parsed = moneySchema.safeParse(req.body); 
    //console.log("amount frontend sends:", parsed)
    if(!parsed.success){
        return res.status(400).json({errors: parsed.error.flatten()})
    }
    const {amount, provider} = parsed.data; //Amount:  undefined
    //console.log("Amount: ", amount)

    if(amount > 10000) { // ₹10,000 in paise
    return res.status(400).json({
        message: "Amount cannot exceed ₹10,000"
    });
}

    const userId = (req as any).userId //cookies
    if(!userId){
        return res.status(401).json({message: "user is not authorised"})
    }

    try {
        //Step 1: Call Dummy Bank API to initiate payment
        const bankResponse = await axios.post('http://localhost:3001/create-payment', {
        amount: amount * 100, // usually in paise 
        userId,
        provider,
        redirectUrl: "http://localhost:3000/webhook" // Bank will call this after payment
        });

        console.log("Bank Response: ", bankResponse.data);
        const {payment_token, paymentUrl} = bankResponse.data;
        console.log("Payment url", paymentUrl)

        //save to DB -> this should be saved in both user and on ramp 
        //or it gets automatically emebed in user according to their ID
        const onramp = await prisma.onRampTx.create({
            data: {
                amount: amount * 100, //// store in paise to avoid decimals
                provider,
                userId,
                token: payment_token,
                status: "Processing",
                startTime: new Date(),
            }
        });
        console.log('Payment saved to db: ',onramp);

        //this will go to paytm frontend
        return res.status(201).json({
            success: true,
            paymentUrl
        });



        //now here i have to make a post req to the frontend so that it happend automatically rght?
    } catch(error: any){
        console.log("Error in Onramp", error.message);
        return res.status(500).json({ 
            success: false,
            message: "Failed to initiate payment. Please try again." 
        });
    }


    


}