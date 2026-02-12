import { Router } from "express";
import { BalanceController } from '@controllers/balance.controller.js';
import { AuthMiddleware } from "@middlewares/auth.middleware.js";


const balanceRoutes = Router();

balanceRoutes.get('/balance', AuthMiddleware.authenticateUser,BalanceController.getBalance)

export default balanceRoutes