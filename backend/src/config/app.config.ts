import dotenv from "dotenv";

dotenv.config();

export const appConfig = {
    host: process.env.APP_HOST || "localhost",
    port: parseInt(process.env.APP_PORT || "3000", 10),
    nodeEnv: process.env.NODE_ENV || 'development',

    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
} as const;


