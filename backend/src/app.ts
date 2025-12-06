import express from "express";
import type {Request, Response, NextFunction} from "express";
import {prisma, connectDB} from "./db/prisma.js"
import { appConfig } from "@config/app.config.js";
import { AuthController } from "@controllers/auth.controllers.js";
import { AuthMiddleware } from "@middlewares/auth.middleware.js";
import cookieParser from "cookie-parser";
import cors from "cors"
import axios from "axios";
import { log } from "console";

const app = express();
app.use(cookieParser());

app.use(cors()); // Allows all origins

// app.use(cors({
//   origin: 'http://localhost:5173'  // Vite default
// }))

//every incoming requesting that browser is sending is goes through this middleware before acutally hitting our route
//This looks at header: Content-Type: application/json
app.use(express.json()); 

//Logging Middleware
// app.use((req: Request,res:Response, next: NextFunction) => {
//     console.log("Incoming req: ");
//     console.log(`req.headers: ${JSON.stringify(req.headers)}`)
//     console.log(`req.body: ${JSON.stringify(req.body)}`);
//     console.log(`req.url: ${req.originalUrl}`);
//     next();
// });


async function testConnection(){
  const isConnected = await connectDB();
  if(!isConnected){
    console.error("Failed to connected to db");
    process.exit(1) //stop the whole server is db is not connected
  }
}
testConnection();

//signup route
app.post('/signup', AuthController.register);

//login route
app.post('/login',AuthController.login);

//refresh token
app.post('/refreshToken', AuthMiddleware.authenticateUser, AuthController.refreshToken, (req,res) => {
  res.json({message:'refresh token page '})
});

//logout page
app.get('/logout',AuthMiddleware.authenticateUser, AuthController.logout, (req, res) => {
  console.log((req as any).user?.userId)
});

app.get("/auth", AuthMiddleware.authenticateUser, (req, res) => {
  console.log("req.userId", (req as any).userId)
});

//add money to wallet -> recieve a request from frontend
app.post('/add-money',AuthMiddleware.authenticateUser,AuthController.refreshToken, async (req: Request, res:Response) => {
  const {amount, provider = "HDFC"} = req.body;

  if(!amount || amount <=0){
    return res.status(400).json({message: "Invalid amount"});
  }

  const userId = (req as any).userId //from cookies
  if(!userId){
    return res.status(401).json({message: "Unauthorized"})
  }
  

  try{
    // 1. Call Dummy Bank to create payment session
    //calling dummy bank server using axios (server <----> server)
    const bankResponse = await axios.post('http://localhost:3001/create-payment', {
      amount: amount * 100, //// usually in paise, but we'll keep as rupees for simplicity 
      provider,
      userId,
      redirectUrl: "http://localhost:3000/onramp/webhook" //Bank needs to know where to send the webhook later.
    });

    const {payment_token, paymentUrl} = bankResponse.data; //Bank returns a unique payment_token + payment URL

    // 2. Save to your DB
    const onramp = await prisma.onRampTx.create({
      data: {
        amount: amount * 100, //// store in paise to avoid decimals
        provider,
        userId,
        token: payment_token,
        status: "Processing",
        startTime: new Date(),
      }
    });

    // 3. Redirect user's BROWSER to bank's payment page
    // Option A: If this is called from frontend (recommended)
    return res.json({ paymentUrl });  // frontend will redirect

    // Option B: If you want server to redirect directly (works but less flexible)
    //  return res.redirect(paymentUrl);

  }catch(error){
    console.error("Bank communication failed:", error.message);
    return res.status(500).json({ message: "Payment initiation failed" });
  }
  


  //console.log("bankResponse ", bankResponse.data);

  //saving to db
  // 

  // console.log(`onramp: ${onramp}`)
  
 
  //console.log(paymentResponse)

  // res.json({
  //   token: bankResponse.data.token,
  //   paymentUrl :bankResponse.data.paymentUrl
  // });

  //now here we have to call dummy bank api -> but how ? through axios? res.redirect?
});

// app.get("/onramp/webhook", (req, res)=> {
//   res.send('Webhook')
// })

app.listen(appConfig.port, ()=>{
  console.log("Server is running")
});


