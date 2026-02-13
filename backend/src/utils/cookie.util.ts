import type { CookieOptions } from "express";
import {appConfig} from "@config/app.config.js"

const isProd = appConfig.nodeEnv === 'production';

//Base cookie configuration
const baseCookieOptions: CookieOptions = {
    httpOnly: true, // Prevents JavaScript access (XSS protection)
    secure: isProd, // Only HTTPS in production , only sent over HTTPS 
    sameSite: isProd ? 'none' : 'lax', // CSRF protection
    path: '/', // Available on all routes
};

//Access Token Cookie (short-lived)
export const accessCookieOptions: CookieOptions = {
    ...baseCookieOptions,
    maxAge: 15 * 60 * 1000,  // 15 minutes in milliseconds
}

//Refresh Token Cookie (long-lived)
export const refreshCookieOptions: CookieOptions = {
    ...baseCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,  
}


//Helper to clear cookies (for logout)
export const clearCookieOptions: CookieOptions = {
    ...baseCookieOptions,
    maxAge: 0 //Expire Immediately
}

console.log('🍪 Cookie config:', {
    environment: appConfig.nodeEnv,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
});
