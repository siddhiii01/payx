import { prisma } from "@db/prisma.js";
import axios from "axios";
import type { Request, Response } from "express";
import z from "zod";

const PROVIDERS = ["HDFC", "AXIS", "SBI"] as const;

const BANK_URL = process.env.BANK_URL 
const WEBHOOK_URL  = process.env.WEBHOOK_URL  
const FRONTEND_URL = process.env.FRONTEND_URL 

if (!BANK_URL || !WEBHOOK_URL || !FRONTEND_URL) {
    throw new Error("Missing required env vars: BANK_URL, WEBHOOK_URL, FRONTEND_URL");
}

const moneySchema = z.object({
    amount : z
        .number()
        .min(1,"Amount must be at least Rs.1")
        .max(20000,"Amount cannot exceed 20,000 Rs.")
        .positive("Amount must be positive"),
    provider: z.enum(PROVIDERS),
});



/**
 * onramptx - Initiates bank-to-wallet transfer (on-ramping)
 * Flow:
 * 1. Validate input (amount + provider)
 * 2. Auth check (userId from middleware)
 * 3. Convert amount to paise (smallest unit – prevents rounding errors)
 * 4. Call dummy/real bank API to create payment intent
 * 5. Save pending transaction in DB
 * 6. Return payment URL → frontend redirects user to bank approval page
 */

export const onramptx = async (req: Request, res: Response) => {
    //Validate request body with Zod
    const parsed = moneySchema.safeParse(req.body); 
    if(!parsed.success){
        return res.status(400).json({
            success: false,
            errors: z.prettifyError(parsed.error),
            message: "Invalid input data",
        })
    }
    const {amount, provider} = parsed.data;

    // Authentication check
    const userId = req.userId //from cookies/middleware
    if(!userId){
        return res.status(401).json({
            success: false,
            message: "Unauthorized - user not authenticated",
        })
    }

    try {
        // Convert INR → paise (1 INR = 100 paise)
        const amountInPaise = Math.round(amount * 100); // round to avoid floating point issues

        //callback URLs (server-to-server webhook + user redirect after bank action)
        const webhookUrl = `${WEBHOOK_URL}/webhook`; // bank will POST result here
        const userReturnUrl = `${FRONTEND_URL}/payment-status` // user redirected here after approve/decline

        // Debug payload 
        if (process.env.NODE_ENV === "development") {
            console.log("Initiating on-ramp payment:", {
                amount: amountInPaise,
                userId,
                provider,
                webhookUrl,
                userReturnUrl,
            }); 
        }

        // Call Bank API to create payment intent
        const bankResponse = await axios.post(
            `${BANK_URL}/create-payment`,
            {
                amount: amountInPaise, // paise to bank 
                userId,
                provider,
                webhookUrl, //Server-to-server notification
                userReturnUrl, //User redirect after approve/decline
            },
            {
                timeout: 15000,  // 15s timeout – prevents hanging forever
            }
        );

        const {payment_token, paymentUrl} = bankResponse.data;
        if (!paymentUrl || !payment_token) {
            throw new Error("Bank did not return valid payment URL or token");
        }

        //save to DB -> this should be saved in both user and on ramp 
        const onrampTx = await prisma.onRampTx.create({
            data: {
                amount: amountInPaise,
                provider,
                userId,
                token: payment_token,
                status: "Processing",
            }, 
        });
        console.log('Payment saved to db: ',onrampTx);

        // Debug success
        if (process.env.NODE_ENV === "development") {
        console.log("OnRamp transaction created:", {
            id: onrampTx.id,
            token: payment_token,
            amount: amountInPaise / 100,
        });
        }

        // Success response – frontend will redirect user
        return res.status(201).json({
            success: true,
            paymentUrl, // this is what frontend uses for window.location.href
            transactionId: onrampTx.id, // optional – helpful for polling later
        });
    } catch(error: any){
        console.error("Onramp initiation failed:", {
        message: error.message,
        code: error.code,                    // e.g. ECONNREFUSED, ETIMEDOUT
        response: error.response?.data,      // if bank sent something back
        status: error.response?.status,
        stack: error.stack?.slice(0, 500)    // first part of stack trace
        });

        // User-friendly message 
        const userMessage =
            error.response?.status === 429
                ? "Bank server is waking up. Please wait 30 seconds and try again."
                : error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT"
                ? "Cannot reach bank server. Please try again in a moment."
                : error.response?.data?.message ||
                "Failed to initiate payment. Please try again later.";
                
        return res.status(500).json({ 
            success: false,
            message: userMessage
        });
    }


    


}