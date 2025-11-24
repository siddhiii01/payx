import express from "express";
import type {Request, Response, NextFunction} from "express";
import dotenv from "dotenv";
import jwt, {JwtPayload} from "jsonwebtoken";
import {prisma, connectDB} from "./db/prisma.js"
import { SignupSchema } from "./schemas/SignupSchema.js";
import z from "zod";

dotenv.config();
const app = express();

const privateKey = process.env.JWT_PRIVATE_KEY as string;
const publicKey = process.env.JWT_PUBLIC_KEY as string;


//every incoming requesting that browser is sending is goes through this middleware before acutally hitting our route
//This looks at header: Content-Type: application/json
app.use(express.json()); 

//Logging Middleware
app.use((req: Request,res:Response, next: NextFunction) => {
    console.log("Incoming req: ");
    console.log(`req.headers: ${JSON.stringify(req.headers)}`)
    console.log(`req.body: ${JSON.stringify(req.body)}`);
    console.log(`req.url: ${req.originalUrl}`);
    next();
});

app.get('/test', (req: Request, res: Response) => {
  res.send("testing route")
});

// app.post('/data', (req: Request, res:Response) => {
//     const {name} = req.body;
//     const {id} = req.query;

//     res.status(200).json({
//       data: [req.body, req.query]
//     })
// })

// Initialize Prisma with adapter
// const prisma = new PrismaClient({});




// async function testConnection() {
//   try {
//     // Test database connection
//     await prisma.$connect();
//     console.log('Prisma connected successfully!');
//   } catch (error) {
//     console.error('Prisma connection failed:', error);
//   } finally {
//     console.log("Prisma disconnected");
//     await prisma.$disconnect();
//   }
// }

// testConnection();

// app.get('/test', (req: Request, res: Response) => {
//     console.log("Test Route");
//     res.send('Test Route');
// })

// const token = jwt.sign({foo: 'bar'}, privateKey)
// console.log(`JWT TOKEN RECEIVED FROM SERVER: ${token}`);

// const decode = jwt.decode(token) as JwtPayload | null;
// console.log(`DECODE JWT: ${decode}`);

// try {
//   const verified = jwt.verify(token, privateKey) as JwtPayload;
//   console.log("VERIFYING JWT TOKEN:", verified);
// } catch (error) {
//   console.error("JWT verification failed:", error);
// }

// const users: any= []

// function hashedFunction(password: any){
//   return "_hashed" + password
// }

// app.post('/api/signup', (req, res) => {

//   const { name, password } = req.body;

//   // 1. INPUT VALIDATION
//   if (!name || !password) {
//     return res.status(400).json({
//       success: false,
//       message: "Missing fields",
//     });
//   }

//   if (password.length < 6) {
//     return res.status(400).json({
//       success: false,
//       message: "Password length is too short",
//     });
//   }

//   // 2. CHECK EXISTING USER
//   const existingUser = users.find(u => u.name === name);
  
//   if (existingUser) {
//     return res.status(409).json({
//       success: false,
//       message: "User already exists",
//     });
//   }

//   // 3. CREATE USER
//   const hasedpassword = hashedFunction(password)
//   const newUser = { name, hasedpassword };
//   users.push(newUser);

//   // 4. SEND FINAL RESPONSE
//   return res.status(201).json({
//     success: true,
//     message: "New user created",
//     data: newUser
//   });
// });


// app.post('/api/login', (req,res) => {
//   //check if the users exist in a database or not -> if he doesn't redirect to him on /api/signup page
//   //if the user exist in databse fetch the info and check the crendentials maybe
//   //generate a token 
// })


async function testConnection(){
  const isConnected = await connectDB();
  if(!isConnected){
    console.error("Failed to connected to db");
    process.exit(1) //stop the whole server is db is not connected
  }
}

testConnection();


async function main(){
  //create a new user
  const user = await prisma.user.create({
    data: {
      name: "Bob",
      email: "Bob@prisma.io",
      password: "Bob$$$"
    }
  });


  console.log("User created");

  const allUser = await prisma.user.findMany({});
  console.log("All users: ", JSON.stringify(allUser, null, 2))
}

//main()

app.post('/zod-testing', async (req: Request, res: Response) => {
  try{
    //Validates request body
    const userData = SignupSchema.parse(req.body);

    //userData is now 100% safe
    const user = await prisma.user.create({data: userData});

    res.status(201).json({
      success: true,
      user
    });

  } catch(error){
      console.error(error)
  }
});

app.listen(process.env.PORT, () => {
    console.log("Server is running")
});

