import {PrismaClient} from "@prisma/client";

//Create a single sgared PrismaClient instance
export const prisma = new PrismaClient({});

//Test Connection function
export async function connectDB() {
    try{
        await prisma.$connect();
        console.log("Database connected successfully");
        return true
    }catch(error){
        console.error("Database connection Failed");
        return false;
    }
}

//Gracefully shutdwn
export async function disconnectDB(){
    await prisma.$disconnect();
    console.log("Database Disconnected");
}