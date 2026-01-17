import express from "express";
import type {Request, Response, NextFunction} from "express";
import {prisma, connectDB} from "./db/prisma.js"
import { appConfig } from "@config/app.config.js";
import { AuthController } from "@controllers/auth.controllers.js";
import cookieParser from "cookie-parser";
import cors from "cors"
import axios from "axios";
import { log } from "console";
import { AuthMiddleware } from "@middlewares/auth.middleware.js";
import { onramptx } from "@controllers/onramp.controller.js";
import { p2p } from "@controllers/p2p.controller.js";
import { Webhook } from "@controllers/webhook.handler.controller.js";
import { getBalance } from "@controllers/getBalance.js";
import { Dashboard } from "@controllers/dashboard.controllers.js";
import { errorHandler } from "@utils/errorHandler.js";

const app = express();


app.use(errorHandler)
app.use(cors({
  origin: "http://localhost:5173",  
  credentials: true,   //allow browser to send cookies when  making req from this origin -> cookies allowed
}));



app.use(cookieParser());
// app.use(cors({
//   origin: 'http://localhost:5173'  // Vite default
// }))


app.use((req, res, next) => {
    console.log("Incoming cookies:", req.cookies);
    next();
});

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
app.post('/refresh',AuthController.refreshToken);

//logout page
app.get('/logout',AuthMiddleware.authenticateUser, AuthController.logout, (req, res) => {
  console.log((req as any).user?.userId)
});






//add money to wallet -> recieve a request from frontend

app.post('/addtowallet',AuthMiddleware.authenticateUser, onramptx);



// This route should not require authentication (like JWT or cookies).
//  Why? Because the bank (your dummy bank server) is calling it from the 
//  server-side, not from a user's browser. It doesn't have user cookies.
app.post('/webhook', Webhook.webhookhanlder)


app.listen(appConfig.port, ()=>{
  console.log("Server is running")
});




app.post('/p2ptransfer',AuthMiddleware.authenticateUser, p2p.walletTransfer);

app.get('/getBalance',AuthMiddleware.authenticateUser, getBalance)

app.get('/dashboard', AuthMiddleware.authenticateUser, Dashboard.getUserName)
// app.post('/dbupdate', async (req, res) => {
//   const {userId, token, amount} = req.body.paymentInformation
//   console.log("dbupdate", userId, token, amount)
//   try {
//         await prisma.$transaction([
//             prisma.balance.updateMany({
//                 where: {
//                     userId: Number(userId)
//                 },
//                 data: {
//                     amount: {
//                         // You can also get this from your DB
//                         increment: Number(amount)
//                     }
//                 }
//             }),
//             prisma.onRampTx.updateMany({
//                 where: {
//                     token: token
//                 }, 
//                 data: {
//                     status: "Success",
//                 }
//             })
//         ]);

//         res.json({
//             message: "Captured"
//         })
//     } catch(e) {
//         console.error(e);
//         res.status(411).json({
//             message: "Error while processing webhook"
//         })
//     }
//   //res.send("This was from webhook hablder to paytm")
//   // res.json({message: "This was from webhook hablder to paytm"})
// })

