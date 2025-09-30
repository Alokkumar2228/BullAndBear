import express from 'express';
import {createOrder,verifyPayment,capturePayment} from '../controllers/paymentController.js';
import {clerkAuth} from '../middleware/clerkAuth.js';

const paymentRouter = express.Router();

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Payment Error:', err);
  res.status(500).json({
    success: false,
    message: 'Payment processing error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
};

// Wrap async route handlers
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

paymentRouter.post('/create-order', clerkAuth, asyncHandler(createOrder));
paymentRouter.post('/verify', clerkAuth, asyncHandler(verifyPayment));
paymentRouter.post('/capture', express.raw({ type: "application/json" }), asyncHandler(capturePayment));

// // Apply error handling middleware
// paymentRouter.use(errorHandler);

export default paymentRouter;