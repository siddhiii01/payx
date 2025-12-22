import { authConfig } from '@config/auth.config.js';
import jwt from "jsonwebtoken";
import type { Response } from "express";
import { prisma } from '@db/prisma.js';
import { appConfig } from '@config/app.config.js';

export const generateToken = async (user: {id: number}, res:Response) => {
    const accessToken = jwt.sign(
        { userId: user.id },
        authConfig.secret,
        { expiresIn: authConfig.expiresIn as any }
    );

    const refreshToken = jwt.sign(
        { userId: user.id },
        authConfig.refreshSecret,
        { expiresIn: authConfig.refreshExpiresIn as any }
    );

    await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken }
    });

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: appConfig.nodeEnv === "production",
        maxAge: 15 * 60 * 1000,
        sameSite: "strict"
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: appConfig.nodeEnv === "production",
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "strict"
    });

    return { accessToken, refreshToken };

}