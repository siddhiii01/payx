import { registerSchema, loginSchema } from "shared_schemas";
import type {Request, Response} from "express";
import {prisma} from "@db/prisma.js"
import { comparePassword, hashPassword } from "@utils/password.utils.js";
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from "@utils/AppError.js";
import { issueTokenPair } from "@utils/issueToken.util.js";
import { accessCookieOptions, refreshCookieOptions, clearCookieOptions } from "@utils/cookie.util.js";
import z from "zod";
import { generateAccessToken, verifyRefreshToken } from "@utils/jwt.utils.js";

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
    

    //Token Refreshing 
    //POST /api/auth/refresh
    //Here the user send the refresh token (in cookie)
    static refreshToken = asyncHandler(async (req: Request, res: Response) => {
        //Extract refresh token from cookie
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            throw new AppError("No refresh token provided", 401);
        }

        //Verify refresh token signature and expiry
        let decoded;
        try {
            decoded = verifyRefreshToken(refreshToken); //this fun does 2 things checks was token tampered with ? and checks if the token is expired
        } catch (error) {
            //token is expird on invalid
            throw new AppError("Invalid or expired refresh token", 403);
        }

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                tokenVersion: true,
                refreshToken: true,  // The HASHED refresh token
            }
        });

        if (!user) {
            throw new AppError("User not found", 403);
        }

        // Verify token version (check if user logged out)
        if (user.tokenVersion !== decoded.tokenVersion) {
            // User logged out - this token is from before logout
            res.clearCookie("accessToken", clearCookieOptions);
            res.clearCookie("refreshToken", clearCookieOptions);
            throw new AppError("Token has been invalidated", 403);
        }

        // Verify the refresh token matches what's stored in DB
        if (!user.refreshToken) {
            throw new AppError("No refresh token found", 403);
        }

        const isValidRefreshToken = await comparePassword(
            refreshToken,  // The token from cookie (plain text)
            user.refreshToken  // The hashed token from DB
        );

        if (!isValidRefreshToken) {
            res.clearCookie("accessToken", clearCookieOptions);
            res.clearCookie("refreshToken", clearCookieOptions);
            throw new AppError("Invalid refresh token", 403);
        }

        // Generate NEW access token (with current tokenVersion)
        const newAccessToken = generateAccessToken({
            userId: user.id,
            tokenVersion: user.tokenVersion, //db's version
            email: user.email,
        });

        // Set new access token cookie
        res.cookie("accessToken", newAccessToken, accessCookieOptions);


        return res.status(200).json({
            success: true,
            message: "Token refreshed successfully"
        });



    });

}