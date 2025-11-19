import express from "express";
import type {Request, Response, NextFunction} from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client"; // Default location

dotenv.config();
const app = express();

app.use(express.json()); //to parse json for req.body, post, patch req 

//Logging Middleware
app.use((req: Request,res:Response, next: NextFunction) => {
    console.log("Incoming req: ");
    console.log(`req.headers: ${JSON.stringify(req.headers)}`)
    console.log(`req.bpdy: ${JSON.stringify(req.body)}`);
    console.log(`req.url: ${req.originalUrl}`);
    next();
});


// Initialize Prisma with adapter
const prisma = new PrismaClient({});




async function testConnection() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('Prisma connected successfully!');
  } catch (error) {
    console.error('Prisma connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

app.get('/test', (req: Request, res: Response) => {
    console.log("Test Route");
    res.send('Test Route');
})

app.listen(process.env.PORT, () => {
    console.log("Server is running")
});

