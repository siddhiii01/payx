export const authConfig = {
    //// JWT Configuration
    secret: process.env.JWT_ACCESS_SECRET || "",
    expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || "",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
} as const;