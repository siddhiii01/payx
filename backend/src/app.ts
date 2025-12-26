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

//home route
app.post('/', (req, res) => {
  const username = req.body
  res.send(`${username}`)
})
// app.post('/signin', AuthController.signup)
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

app.post('/addmoneytowallet',AuthMiddleware.authenticateUser, AuthController.refreshToken, async (req: Request, res:Response) => {
  const {amount, provider = "HDFC"} = req.body;
  if(!amount || amount <=0){
    return res.status(400).json({message: "Invalid amount"});
  }

  const userId = (req as any).userId //from cookies
  if(!userId){
    return res.status(401).json({message: "Unauthorized"})
  }

  try{
    //creating a record in db with status processing
    // const walletmoney = await prisma.onRampTx.create({
    //   data: {
    //     amount: amount *100,
    //     provider,
    //     token: "ahjsdkhdsa", //this token will be provided from the bank right
    //     userId,
    //     status: "Processing",
    //     startTime: new Date(),
    //   }
    // });

    // console.log(`Saved to DB: ${walletmoney}`)

    // 1. Call Dummy Bank to initiate Payment
    //calling dummy bank server using axios (server <----> server)
    const bankResponse = await axios.post('http://localhost:3001/create-payment', {
      amount: amount * 100, // usually in paise, but we'll keep as rupees for simplicity 
      provider,
      userId,
      redirectUrl: "http://localhost:3000/webhook" // Bank will call this after payment
    });

    console.log("bankResponse", bankResponse)
    // const {payment_token, paymentUrl} = bankResponse.data; //Bank returns a unique payment_token + payment URL

    // // 2. Save to your DB
    // const onramp = await prisma.onRampTx.create({
    //   data: {
    //     amount: amount * 100, //// store in paise to avoid decimals
    //     provider,
    //     userId,
    //     token: payment_token,
    //     status: "Processing",
    //     startTime: new Date(),
    //   }
    // });

    // // 3. Redirect user's BROWSER to bank's payment page
    // // Option A: If this is called from frontend (recommended)
    // return res.json({ paymentUrl });  // frontend will redirect

    // Option B: If you want server to redirect directly (works but less flexible)
    //  return res.redirect(paymentUrl);

  }catch(error:any){
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

app.post('/dbupdate', async (req, res) => {
  const {userId, token, amount} = req.body.paymentInformation
  console.log("dbupdate", userId, token, amount)
  try {
        await prisma.$transaction([
            prisma.balance.updateMany({
                where: {
                    userId: Number(userId)
                },
                data: {
                    amount: {
                        // You can also get this from your DB
                        increment: Number(amount)
                    }
                }
            }),
            prisma.onRampTx.updateMany({
                where: {
                    token: token
                }, 
                data: {
                    status: "Success",
                }
            })
        ]);

        res.json({
            message: "Captured"
        })
    } catch(e) {
        console.error(e);
        res.status(411).json({
            message: "Error while processing webhook"
        })
    }
  //res.send("This was from webhook hablder to paytm")
  // res.json({message: "This was from webhook hablder to paytm"})
})


app.listen(appConfig.port, ()=>{
  console.log("Server is running")
});


