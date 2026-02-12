import { onramptx } from '@controllers/onramp.controller.js';
import { AuthMiddleware } from '@middlewares/auth.middleware.js';
import { Router } from 'express';


const onrampRoute = Router();

onrampRoute.post('/addtowallet',AuthMiddleware.authenticateUser,   onramptx);

export default onrampRoute;