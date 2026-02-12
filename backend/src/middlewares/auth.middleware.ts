// middlewares/auth.middleware.ts
import { authConfig } from "@config/auth.config.js";
import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "@utils/jwt.utils.js";
import { prisma } from "@db/prisma.js";
import { AppError } from "@utils/AppError.js";

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            userId?: number;
            user?: {
                userId: number;
                email: string;
                tokenVersion: number;
            };
        }
    }
}

export class AuthMiddleware {
    /**
     * Authenticate User Middleware
     * Verifies access token and attaches user to request
     */
    static authenticateUser = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            // 1. Extract token from cookie
            const token = req.cookies.accessToken;

            if (!token) {
                throw new AppError("Access token required", 401);
            }

            // 2. Verify token signature and expiry
            let decoded;
            try {
                decoded = verifyAccessToken(token);
            } catch (error: any) {
                // Token expired or invalid
                throw new AppError(error.message || "Invalid token", 401);
            }

            // 3. Check if user still exists and get current tokenVersion
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    email: true,
                    tokenVersion: true,
                }
            });

            if (!user) {
                throw new AppError("User not found", 401);
            }

            // 4. CRITICAL: Verify token version matches database
            if (user.tokenVersion !== decoded.tokenVersion) {
                throw new AppError("Token has been invalidated", 401);
            }

            // 5. Attach user to request object
            req.userId = user.id;
            req.user = {
                userId: user.id,
                email: user.email,
                tokenVersion: user.tokenVersion,
            };

            next();

        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                });
            }

            return res.status(401).json({
                success: false,
                message: "Authentication failed",
            });
        }
    };
}
