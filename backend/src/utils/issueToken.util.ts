import { generateAccessToken, generateRefreshToken, JWTPayload } from "./jwt.utils.js";
import { hashPassword } from "./password.utils.js";
import { prisma } from "@db/prisma.js";

//Issue a pair of tokens (access + refresh)
export const issueTokenPair = async (payload: JWTPayload) => {
    // Generate both tokens
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Hash refresh token before storing 
    const hashedRefreshToken = await hashPassword(refreshToken);

    //Store hashed refresh token in database
    await prisma.user.update({
        where: {id: payload.userId},
        data: {
            refreshToken: hashedRefreshToken,
        }
    })

    return {
        accessToken,
        refreshToken //send plain text to client 
    }
}