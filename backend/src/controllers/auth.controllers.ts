import { registerSchema, loginSchema } from "shared_schemas";
import type {Request, Response} from "express";
import {prisma} from "@db/prisma.js"
import { comparePassword, hashPassword } from "@utils/password.utils.js";
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from "@utils/AppError.js";
import { issueTokenPair } from "@utils/issueToken.util.js";
import { accessCookieOptions, refreshCookieOptions, clearCookieOptions } from "@utils/cookie.util.js";
import z from "zod";

export class AuthController {

    // LOGIN - Authenticate existing user
    //  POST /api/auth/login
    static login = asyncHandler(async (req: Request, res: Response) => {
        //validate input
        const validation = loginSchema.safeParse(req.body);
        if(!validation.success){
            throw new AppError(
                "Zod Validation Failed",
                400,
                z.prettifyError(validation.error)    
            );
        }

        const {email, password} = validation.data;

        //find user & select only necessary field
        const user = await prisma.user.findUnique({
            where: {email},
            select: {
                id: true,
                email: true,
                phoneNumber: true,
                passwordHash: true,
                name: true,
                tokenVersion: true
            }
        });

        if (!user) {
            throw new AppError("Invalid credentials", 401);
        } 

        //compare the given password with the hashed password
        const isPasswordValid= await comparePassword(password, user.passwordHash)
        if(!isPasswordValid){
            throw new AppError("Invalid credentials", 401);
        }

        //Generate tokens WITH current tokenVersion
        const { accessToken, refreshToken } = await issueTokenPair({
            userId: user.id,
            tokenVersion: user.tokenVersion,
            email: user.email,
        });

        //Set Cookies
        res.cookie("accessToken", accessToken, accessCookieOptions);
        res.cookie("refreshToken", refreshToken, refreshCookieOptions);
        
        //Send response 
        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
            },
        });
    });

    //Register - Create a new user
    //Post /api/auth/signup
    static register = asyncHandler(async (req: Request, res: Response) => {
        //Validate Input with Zod
        let  validation= registerSchema.safeParse(req.body);
        if (!validation.success) {
            throw new AppError(
                "Zod Validation Failed",
                400,
                z.prettifyError(validation.error)   
            );
        }

        const {name, email, password, phoneNumber} = validation.data;
        
        //check if the user already exist in db thru email 
        const existingUser = await prisma.user.findFirst({ 
            where: { 
                OR: [
                    { email },
                    { phoneNumber }
                ] 
            } 
        });

        // user exists
        if (existingUser) {
            if (existingUser.email === email) {
                throw new AppError("Email already registered", 409);
            }
            throw new AppError("Phone number already registered", 409);
        }

        // hash password
        const hashedPassword = await hashPassword(password);

        //Create a new user with  default balance
        const newUser = await prisma.user.create({
            data: {
                email, 
                phoneNumber,
                name,
                passwordHash: hashedPassword, // Store hashed password
                createdAt: new Date(),
                tokenVersion: 0, // Initialize version
                balances: {
                    create: {
                        amount: 0,
                        locked: 0
                    }
                }
            },
            select: {
                id: true,
                email: true,
                phoneNumber: true,
                name: true,
                tokenVersion: true,
            }
        });
        
        //Generate tokens 
        const {accessToken, refreshToken}=  await issueTokenPair({ 
            userId: newUser.id,
            tokenVersion: newUser.tokenVersion,
            email: newUser.email,
        });

        //Set Cookies
        res.cookie("accessToken", accessToken, accessCookieOptions);
        res.cookie("refreshToken", refreshToken, refreshCookieOptions);

        //Send response
        return res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                id: newUser.id,
                email: newUser.email,
                phoneNumber: newUser.phoneNumber,
                name: newUser.name
            }
        });
        
    });

    // LOGOUT - Invalidate user session
    // POST /api/auth/logout
    static logout = asyncHandler(async (req: Request, res: Response) => {
        // Get userId from authenticated request
        const userId = (req as any).userId;

        if (!userId) {
            throw new AppError("User not authenticated", 401);
        }

        // Increment tokenVersion to invalidate ALL existing tokens
        // Also clear refresh token from database
        await prisma.user.update({
            where: { id: userId },
            data: {
                refreshToken: null,
                tokenVersion: { increment: 1 },  // This is the KEY! 🔑
            }
        });

        // Clear cookies
        res.clearCookie("accessToken", clearCookieOptions);
        res.clearCookie("refreshToken", clearCookieOptions);

        return res.status(200).json({
            success: true,
            message: "Logout successful"
        });
    });
    
}