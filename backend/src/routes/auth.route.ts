import { Router } from "express";
import { AuthController } from "@controllers/auth.controllers.js";
import { AuthMiddleware } from "@middlewares/auth.middleware.js";

const authRoutes = Router();

//Public routes (no authentication required)
authRoutes.post('/signup', AuthController.register);
authRoutes.post('/login', AuthController.login);
authRoutes.post('/refresh', AuthController.refreshToken); 

//Protected routes (authentication required)
authRoutes.post('/logout', AuthMiddleware.authenticateUser, AuthController.logout);

export default authRoutes;