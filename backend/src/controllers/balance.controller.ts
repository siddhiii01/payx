import { prisma } from "@db/prisma.js";
import { AppError } from "@utils/AppError.js";
import { asyncHandler } from "@utils/asyncHandler.js";
import type {Request, Response} from 'express';

export class BalanceController {
    static getBalance = asyncHandler( async (req: Request, res: Response) => {

        const userId = (req as any).userId;
        if(!userId) throw new AppError("Unauthorized User", 401);

        // Fetch user + balances from DB
        const user = await prisma.user.findUnique({
            where: {id: userId},
            include: {balances: true}
        });

        if (!user) {
            throw new AppError("User not found", 404);
        }

        if (!user.balances) {
        throw new AppError("Wallet not initialized", 404);
        }
            
        console.log("User balances", user)
        //convert paise to rupees
        const locked = user.balances.locked /100;
        const available = (user.balances.amount - user.balances.locked) / 100;

        return res.status(200).json({
            success: true,
            data: {
                available,
                locked,
                currency: "INR",
            },
        })
    })
}