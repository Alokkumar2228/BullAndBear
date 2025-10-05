import express from 'express';
import { clerkAuth } from '../middleware/clerkAuth.js';
import { getUserData } from '../controllers/userController.js';

const userRouter = express.Router();


userRouter.get('/get-user-data', clerkAuth, getUserData);



export default userRouter;