import express from 'express'
import {createOrder,verifyPayment,capturePayment} from '../controllers/paymentController.js';
import {clerkAuth} from '../middleware/clerkAuth.js'



const paymentRouter = express.Router();

paymentRouter.post('/create-order',clerkAuth,createOrder);
paymentRouter.post('/verify',clerkAuth,verifyPayment)
paymentRouter.post('/capture',express.raw({ type: "application/json" }),capturePayment);


export default paymentRouter