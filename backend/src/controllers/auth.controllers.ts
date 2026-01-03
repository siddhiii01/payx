import { registerSchema, loginSchema } from "shared_schemas";
import type {NextFunction, Request, Response} from "express";
import {prisma} from "@db/prisma.js"
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { authConfig } from "@config/auth.config.js";
import {appConfig} from "@config/app.config.js"
import { generateToken } from "@utils/jwtToken.js";


export class AuthController {
    static login = async (req: Request, res: Response) => {
        const validation = loginSchema.safeParse(req.body);
        if(!validation.success){
            return res.status(400).json({
                success: false,
                message: "validation failed",
                errors: validation.error.flatten()
            })
        }

        const {email, password} = validation.data;

        try{
            //find user from database
            const user = await prisma.user.findUnique({
                where: {email},
                select: {
                    id: true,
                    email: true,
                    phoneNumber: true,
                    password: true,
                    name: true
                }
            });
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid credentials"
                });
            } 

            //compare the given password with the hashed password
            const isPasswordValid: any = await bcrypt.compare(password, user.password)
            if(!isPasswordValid){
                return res.status(401).json({
                    success: false,
                    message: "Invalid credentials",
                });
            }

            //Generate tokens 
            const tokens = await generateToken({ id: user.id }, res);
           
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
        } catch(error){
            console.error("Login error: ", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    static register = async (req: Request, res: Response) => {
        //Validate Input using Zod
        let  validation= registerSchema.safeParse(req.body);
        if (!validation.success) {
            console.log(validation.error.flatten());
            return res.status(400).json({
                success: false,
                message: "Zod validation failed",
                errors: validation.error.flatten()
            });
        }
        //Extract Values
        const {name, email, password, phoneNumber} = validation.data;
        try {
            //check if the user already exist in db thru email 
            const existingUser = await prisma.user.findFirst({ 
                where: { OR: [{ email }, { phoneNumber }] } 
            });
            // user exists -> LOGIN FLOW
            if(existingUser){
                return res.status(409).json({
                    success: false,
                    message: "An account with these credentials already exists. Please try logging in.",    
                });
            }

            // user not found -> SIGNUP FLOW
            //hash the password before storing in database
            const hashedPassword = await bcrypt.hash(password, 10);
            //Create a new user
            const newUser = await prisma.user.create({
                data: {
                    email, 
                    phoneNumber,
                    name,
                    password: hashedPassword, // Store hashed password
                    balances: {
                        create: {
                            amount: 0,
                            locked: 0
                        }
                    }
                }
            });
            
            //Generate tokens for auto-login
            const tokens = await generateToken(newUser, res)
            console.log("Successful Signup : ", tokens, newUser );

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

           
        }catch(error){
            console.error("Signup error:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    static logout = async (req: Request, res: Response) => {
    //    const userId = (req as any).user?.userId;  //nai samjha
        try{
            const userId = (req as any).userId;

            if(userId){
                await prisma.user.update({where : {id: userId}, data: {refreshToken: null}})
            }

            res.clearCookie("accessToken")
            res.clearCookie("refreshToken")

            return res.json({
                message: "logout successfully"
            })
        }catch(error){
             console.error("Logout failed:", error);
        }
    }
    
    //acess token expires fast and refresh token last long -> from this function we will allow or not allow user to get new access token
    static refreshToken = async (req: Request, res: Response) => {
        try {

            //browser automatically sends cookies
            const refreshToken = req.cookies.refreshToken;
            if(!refreshToken){
                return res.status(401).json({
                    message: "No refresh token provided"
                })
            }
            //verfiying refresh token
            let decoded: any;
            try{
                decoded = jwt.verify(refreshToken, authConfig.refreshSecret)
            } catch(error){
                return res.status(403).json({ message: "Invalid or expired refresh token" });
            }

            const userId = decoded.userId;
            //checking if the user exist and refersh token matches
            const user = await prisma.user.findUnique({
                where: { id: userId}
            });
            if(!user || user.refreshToken != refreshToken){
                //token mistmatch
                res.clearCookie("refreshToken");
                res.clearCookie("accessToken");
                return res.status(403).json({ message: "Invalid refresh token" });
            }

            //generate new Access Token
            const newAccessToken = jwt.sign(
                { userId },
                authConfig.secret,
                { expiresIn: authConfig.expiresIn as any }
            );

            //setting new access token cookie
            res.cookie("accessToken", newAccessToken, {
                httpOnly: true,
                secure: appConfig.nodeEnv === "production",
                sameSite: "strict",
                maxAge: 15 * 60 * 1000,
            });

            return res.status(200).json({ message: "Token refreshed" });
        
        } catch(error){
            console.error("Refresh error:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    
}