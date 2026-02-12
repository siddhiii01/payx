import { authConfig } from '@config/auth.config.js';
import jwt, { JwtPayload } from "jsonwebtoken";


//JWT Payload -> this info is needed in every request
export interface JWTPayload {
    userId: number; //every req needs to know who the user is 
    tokenVersion : number; //this helps in immediate logout , if tokenVersion chnages invalidate refresh tokens
    email?: string;
}

//extends payload because after verification, the decoded token includes: cutomdata + jwt metadata 
export interface DecodedToken extends JWTPayload {
    iat: number //Issued at
    exp: number //Expires at
}

//generating access token -> Used for All API Requests
export const generateAccessToken = (payload: JWTPayload):string => { 
    return jwt.sign(
        payload,
        authConfig.secret,
        { expiresIn: authConfig.expiresIn as any}
    );
}


//generating refresh  token -> Used to get new access Token
export const generateRefreshToken = (payload: JWTPayload):string => { 
    return jwt.sign(
        payload,
        authConfig.refreshSecret,
        { expiresIn: authConfig.refreshExpiresIn as any}
    );
}

//verify accessToken : 
export const verifyAccessToken = (token: string):DecodedToken => {
    try{
        return jwt.verify(token, authConfig.secret) as DecodedToken;
    } catch(error){
        if (error instanceof jwt.TokenExpiredError) {
            throw new Error('Access token expired');
        }
        if (error instanceof jwt.JsonWebTokenError) {
            throw new Error('Invalid access token');
        }
        throw new Error('Token verification failed');
    }
}

export const verifyRefreshToken = (token: string): DecodedToken => {
    try {
        return jwt.verify(token, authConfig.refreshSecret) as DecodedToken;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new Error('Refresh token expired');
        }
        if (error instanceof jwt.JsonWebTokenError) {
            throw new Error('Invalid refresh token');
        }
        throw new Error('Token verification failed');
    }
};






