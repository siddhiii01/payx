import {PrismaClient} from "@prisma/client";

//Create a single sgared PrismaClient instance
export const prisma = new PrismaClient({});

//Test Connection function
export async function connectDB() {
    try{
        await prisma.$connect();
        console.log("Database connected successfully");

//         const result = await prisma.$queryRawUnsafe(`
//     SELECT table_schema, table_name 
//     FROM information_schema.tables 
//     WHERE table_schema='public';
//   `);

//   await prisma.$executeRawUnsafe(`DROP SCHEMA public CASCADE;`);
// await prisma.$executeRawUnsafe(`CREATE SCHEMA public;`);
//   console.log(result);
        return true
    }catch(error){
        console.error("Database connection Failed", error);
        throw error;
    }
}

//Gracefully shutdwn
export async function disconnectDB(){
    await prisma.$disconnect();
    console.log("Database Disconnected");
}