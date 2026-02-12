import 'dotenv/config'
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

import { Dashboard } from "@controllers/dashboard.controllers.js";
import { errorHandler } from "@utils/errorHandler.js";
import authRoutes from "@route/auth.route.js";
import balanceRoutes from "@route/balance.route.js";
import { TransactionController } from "@controllers/transaction.controller.js";
import { ChartController } from "@controllers/chart.controller.js";
import onrampRoute from '@route/onramp.route.js';

const app = express();

//CORS Configuration
const allowedOrigins = [
    appConfig.frontendUrl,
    'http://localhost:5173',
    'http://localhost:3000',
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true, //Allow Cookies
}));


//Body parsing & Cookies
app.use(cookieParser());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

//Logging Middleware 
if(appConfig.nodeEnv === 'development'){
  app.use((req: Request,res:Response, next: NextFunction) => {
    console.log(`${req.method} ${req.path}`);
    console.log('Cookies:', req.cookies);
    next();
  });
}

// async function testConnection(){
//   const isConnected = await connectDB();
//   if(!isConnected){
//     console.error("Failed to connected to db");
//     process.exit(1) //stop the whole server is db is not connected
//   }
// }
// testConnection();



//home route

app.post('/', (req, res) => {
  const username = req.body
  res.send(`${username}`)
})

//AUth routes public
app.use('/api/auth', authRoutes);

//Protected Routes require Authentication
app.get("/api/chart/volume", AuthMiddleware.authenticateUser, ChartController.getTransactionVolume);
app.get("/api/transactions", AuthMiddleware.authenticateUser, TransactionController.getUserTransactions);
app.get("/api/transaction/latest", AuthMiddleware.authenticateUser, TransactionController.getLatestUserTransaction);
app.get('/dashboard', AuthMiddleware.authenticateUser, Dashboard.getUserName)

//Wallet operations (protected)
app.use('/api', balanceRoutes);
app.use('/api', onrampRoute);
app.post('/p2ptransfer',AuthMiddleware.authenticateUser, p2p.walletTransfer);

//Webhook (public - called by external service)
app.post('/webhook', Webhook.webhookhanlder);


//Error Handling
//404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.path
    });
});
app.use(errorHandler) //Global Error Handler


//Start Server
app.listen(appConfig.port, ()=>{
  console.log(`Server running on port ${appConfig.port}`);
    console.log(`Environment: ${appConfig.nodeEnv}`);
    console.log(`Frontend: ${appConfig.frontendUrl}`);
});





