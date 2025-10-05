import express from 'express';
import {handleSvixWebhook} from '../controllers/userController.js';

const authRouter = express.Router();

authRouter.post('/auth', handleSvixWebhook);

export default authRouter;
