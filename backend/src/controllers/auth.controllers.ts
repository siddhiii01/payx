import { authSchema } from "@validations/auth.schema.js";
import { z} from "zod";
import type {Request, Response} from "express";
import {prisma} from "@db/prisma.js"
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { authConfig } from "@config/auth.config.js";
import {appConfig} from "@config/app.config.js"

export class AuthController {
    static login = async (req: Request, res: Response) => {
        const {email, password} = req.body as z.infer<typeof authSchema.login>;
        try{
            const existingUser = await prisma.user.findUnique({where: {email}});

            // Check if user exists
            if (!existingUser) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid credentials"
                });
            } 

            //compare the given password with the hashed password
            const isPasswordValid: any = await bcrypt.compare(password, existingUser.password)

            if(isPasswordValid){
                console.log("true")
            }else {
                // Use same message as above for security
                return res.status(401).json({
                    success: false,
                    message: "Invalid credentials"
                });
            }

            //creating short-lived token for API calls
            const accessToken = jwt.sign(
                {userId: existingUser.id}, //payload
                authConfig.secret,      //secret key
                { expiresIn: authConfig.expiresIn as any} //options
            );
            

            //creating refresh token -> for token renewal
            const refreshToken = jwt.sign(
                {userId: existingUser.id},
                authConfig.refreshSecret,
                {expiresIn: authConfig.refreshExpiresIn as any}
            );

            console.log("Refresh Token: ", refreshToken);

             await prisma.user.update({ where: { email }, data: { refreshToken } });


            //setting accessToken & refresh Token  as cookie 
            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: appConfig.nodeEnv === "production",
                maxAge: 15 * 60 * 1000,
                sameSite: "strict"
            });

            console.log("Access Token: ", accessToken);
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: appConfig.nodeEnv === "production",
                maxAge: 24 * 60 * 60 * 1000,
                sameSite: "strict"
            });


            res.json({
                id: existingUser.id,
                message: "SUccessful",
                accessToken,
                refreshToken
            })

        } catch(error){
            console.error("Login error: ", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    static register = async (req: Request, res: Response) => {
         let {name, password, email, number} = req.body as z.infer<typeof  authSchema.register>;
        try {
           
            //check if the user already exist in db thru email 
            const existingUser = await prisma.user.findUnique({ where: {email} });

            if(existingUser){
                return res.status(400).json({
                    success: false,
                    message: "User already exist. Please login"
                })
            }
            
            //hash the password before storing in database
            const hashedPassword = await bcrypt.hash(password, 10);

            //Create a new user
            const user = await prisma.user.create({
                data: {
                    name, 
                    email, 
                    number,
                    password: hashedPassword // Store hashed password
                }
            })
        
            res.status(201).json({
                success: true,
                message: "User created successfully",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    number: user.number
                    }
                })
        } catch(error){
            console.error(error);
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
        try {//getting the user from req -> who the user is? -> this is set by authmiddleware
            const userId = (req as any).userId;
            //getting refresh token from the from the cookies
            const refreshToken = req.cookies.refreshToken;

            //if anyone of the missing user is not authorised
            if(!userId || !refreshToken){
                return res.json({
                    message: "U are not authorised"
                })
            }

            //now since userId -> is the has the same value from databse id key -> what id if someone tries to manually set userId
            //so check whether that use is in the db
            const user = await prisma.user.findUnique({where : {id: userId}});
            if(!user || !user?.refreshToken){
                res.json({
                    message: "User doesn't exist in db or user dosen't have refreshToken"
                });
            }

            if(refreshToken !== user?.refreshToken){
                return res.json({
                    message: "Token mistmatch"
                })
            }

            //generate new access token
            const newAccessToken = jwt.sign(
                { userId },
                authConfig.secret,
                { expiresIn: authConfig.expiresIn as any}
            );

            
            res.cookie("accessToken", newAccessToken, {
                httpOnly: true,
                secure: appConfig.nodeEnv === "production",
                maxAge: 15 * 60 * 1000,
                sameSite: "strict",

            })

            return res.json({ message: "Access token refreshed" });
        } catch(error){
            return res.status(500).json({ message: "Refresh failed" });
        }
    }
}