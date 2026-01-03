import { prisma } from "@db/prisma.js";
import type {Request, Response} from "express";
import z from "zod";

const paymentSchema = z.object({
    amount: z.number().min(1).max(10000),
    phoneNumber: z.string().trim()
});

export class p2p {
    static walletTransfer = async (req: Request, res: Response) => {
        const parsed = paymentSchema.safeParse(req.body)
        if(!parsed.success){
            return res.status(400).json({message: "Invalid data"})
        }
        const {phoneNumber, amount } = parsed.data

        const user = await prisma.user.findUnique({
            where: {phoneNumber},
            include: {
                balances: true
            }
        });

        try {
            if(!user?.phoneNumber){
                return res.status(400).json({message: "No such user exist"})
            }

            if(!user?.balances){
                throw new Error("Balance is 0");
            }

            if(amount > user.balances?.amount){
                throw new Error("Not enough balances")
            }
        } catch(error){
            console.log(error)
        }

        

        

        // //if this line past balances exist
        // if(!user.balances){
        //     return res.status(500).json({ message: "Wallet not initialized" });
        // }
        // //now checking if the user has that amount of money
        // //here user.balances cannot be null becoz of above statement
        // if(amount > user.balances.amount){
        //     return res.status(400).json({message: "Insufficient wallet balance"})
        // }
        // const userId = user.id;

        // //now i have to update the db.
        // const updatedamt = await prisma.user.update({
        //     where: {id: userId},
        //     data: {
        //         balances: {
        //             update: {
        //                 amount: user.balances.amount - amount
        //             }
        //         }
        //     }, 
        //     include: {
        //         balances: true
        //     }
        // });
        
        
        // return res.json({data: updatedamt})
}

}
