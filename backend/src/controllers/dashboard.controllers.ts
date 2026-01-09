import { prisma } from "@db/prisma.js";
import type { Request, Response } from "express";

export class Dashboard {
    static getUserName = async(req: Request, res: Response) => {
        const userId = (req as any).userId;
        const user = await prisma.user.findUnique({ where : {id: userId}});
        res.status(200).json({data: user?.name});

  
    }
}