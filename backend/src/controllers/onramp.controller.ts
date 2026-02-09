    import { prisma } from "@db/prisma.js";
    import axios from "axios";
    import type { Request, Response } from "express";
    import z from "zod";

    const PROVIDERS = ["HDFC", "AXIS", "SBI"] as const;

    const BANK_API_BASE = process.env.BANK_API_BASE_URL || 'http://localhost:3001';
    const WEBHOOK_BASE   = process.env.WEBHOOK_BASE_URL  || 'http://localhost:3000';
    const FRONTEND_BASE  = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';

    const moneySchema = z.object({
        amount : z.number().min(1).max(20000,"Amount cannot exceed 20,000 Rs."),
        provider: z.enum(PROVIDERS),
    });

    export const onramptx = async (req: Request, res: Response) => {
        const parsed = moneySchema.safeParse(req.body); 
        if(!parsed.success){
            return res.status(400).json({errors: parsed.error.flatten()})
        }
        const {amount, provider} = parsed.data;
    
        const userId = (req as any).userId //from cookies/middleware
        if(!userId){
            return res.status(401).json({message: "user is not authorised"})
        }

        try {
            // Convert to paise 
            const amountInPaise = amount * 100;

            console.log("Sending to bank:", {
                amount: amount * 100,
                userId,
                provider,
                webhookUrl: `${WEBHOOK_BASE}/webhook`,
                userReturnUrl: `${FRONTEND_BASE}/payment-status`
            });

            //Step 1: Call Dummy Bank API to initiate payment
            const bankResponse = await axios.post(`${BANK_API_BASE}/create-payment`, {
            amount: amountInPaise, // paise to bank 
            userId,
            provider,
            webhookUrl: `${WEBHOOK_BASE}`, // Server-to-server notification
            userReturnUrl: `${FRONTEND_BASE}/payment-status`, // NEW: User redirect after approve/decline
            }, {
        timeout: 15000,  // ← good safety: 15 seconds max
    });

            console.log("Bank Response: ", bankResponse.data);
            const {payment_token, paymentUrl} = bankResponse.data;
            console.log("Payment url", paymentUrl)

            //save to DB -> this should be saved in both user and on ramp 
            //or it gets automatically emebed in user according to their ID
            const onramp = await prisma.onRampTx.create({
                data: {
                    amount: amountInPaise,
                    provider,
                    userId,
                    token: payment_token,
                    status: "Processing",
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
            console.error("Onramp initiation failed:", {
            message: error.message,
            code: error.code,                    // e.g. ECONNREFUSED, ETIMEDOUT
            response: error.response?.data,      // if bank sent something back
            status: error.response?.status,
            stack: error.stack?.slice(0, 500)    // first part of stack trace
            });
            return res.status(500).json({ 
                success: false,
                message: "Failed to initiate payment. Please try again." 
            });
        }


        


    }