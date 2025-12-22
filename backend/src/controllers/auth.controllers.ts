import { authSchema } from "shared_schemas";
import type {NextFunction, Request, Response} from "express";
import {prisma} from "@db/prisma.js"
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { authConfig } from "@config/auth.config.js";
import {appConfig} from "@config/app.config.js"
import { generateToken } from "@utils/jwtToken.js";

export class AuthController {
    // static login = async (req: Request, res: Response) => {
    //     const {email, password} = req.body as z.infer<typeof authSchema.login>;

    //     try{
    //         const existingUser = await prisma.user.findUnique({where: {email}});

    //         // Check if user exists
    //         if (!existingUser) {
    //             return res.status(401).json({
    //                 success: false,
    //                 message: "Invalid credentials"
    //             });
    //         } 

    //         //compare the given password with the hashed password
    //         const isPasswordValid: any = await bcrypt.compare(password, existingUser.password)

    //         if(isPasswordValid){
    //             console.log("true")
    //         }else {
    //             // Use same message as above for security
    //             return res.status(401).json({
    //                 success: false,
    //                 message: "Invalid credentials"
    //             });
    //         }

    //         //creating short-lived token for API calls
    //         const accessToken = jwt.sign(
    //             {userId: existingUser.id}, //payload
    //             authConfig.secret,      //secret key
    //             { expiresIn: authConfig.expiresIn as any} //options
    //         );
            

    //         //creating refresh token -> for token renewal
    //         const refreshToken = jwt.sign(
    //             {userId: existingUser.id},
    //             authConfig.refreshSecret,
    //             {expiresIn: authConfig.refreshExpiresIn as any}
    //         );

    //         console.log("Refresh Token: ", refreshToken);

    //          await prisma.user.update({ where: { email }, data: { refreshToken } });


    //         //setting accessToken & refresh Token  as cookie 
    //         res.cookie("accessToken", accessToken, {
    //             httpOnly: true,
    //             secure: appConfig.nodeEnv === "production",
    //             maxAge: 15 * 60 * 1000,
    //             sameSite: "strict"
    //         });

    //         console.log("Access Token: ", accessToken);
    //         res.cookie("refreshToken", refreshToken, {
    //             httpOnly: true,
    //             secure: appConfig.nodeEnv === "production",
    //             maxAge: 24 * 60 * 60 * 1000,
    //             sameSite: "strict"
    //         });


    //         res.json({
    //             id: existingUser.id,
    //             message: "SUccessful",
    //             accessToken,
    //             refreshToken
    //         })

    //     } catch(error){
    //         console.error("Login error: ", error);
    //         return res.status(500).json({
    //             success: false,
    //             message: "Internal server error"
    //         });
    //     }
    // }

    static authenticate = async (req: Request, res: Response) => {
        //Validate Input using Zod
        let  validation= authSchema.register.safeParse(req.body);

        
        console.log("validation.data ", validation.data)
        try {
            if (!validation.success) {
                console.log(validation.error.flatten());
                return res.status(400).json({
                    success: false,
                    message: "Zod validation failed",
                    errors: validation.error.flatten()
                });
            }
            
            //Extract Values
            const {name, email, password, number} = validation.data;
           
            //check if the user already exist in db thru email 
            const existingUser = await prisma.user.findUnique({ where: {number} });

            // user exists -> LOGIN FLOW
            if(existingUser){
                const isValid = await bcrypt.compare(password, existingUser.password)
                if(!isValid){
                    return res.status(400).json({
                        success: false,
                        message: "Invalid credentials"
                    })
                }
                //generate token
                const tokens = await generateToken(existingUser, res)
                //Login Succsessful sending response to frontend
                return res.status(200).json({
                    success: true,
                    message: "Login successful",
                    user: {
                        id: existingUser?.id,
                        name: existingUser?.name,
                        email: existingUser?.email,
                        number: existingUser?.number
                    },
                    data:tokens
                });
            }
            
            
            //// user not found -> SIGNUP FLOW
            //hash the password before storing in database
            const hashedPassword = await bcrypt.hash(password, 10);
            //Create a new user
            const newUser = await prisma.user.create({
                data: {
                    email, 
                    number,
                    name,
                    password: hashedPassword // Store hashed password
                }
            });
            
            //generate jwt token
            const tokens = await generateToken(newUser, res)
            // respond with success
            return res.status(201).json({
                success: true,
                message: "User created successfully",
                user: {
                id: newUser.id,
                email: newUser.email,
                number: newUser.number,
                name: newUser.name
                },
                data:tokens
            });

          

        }catch(error){
            console.error("Auth error:", error);
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
    static refreshToken = async (req: Request, res: Response, next: NextFunction) => {
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

            //return res.json({ message: "Access token refreshed" });
            next()
        } catch(error){
            return res.status(500).json({ message: "Refresh failed" });
        }
    }
}