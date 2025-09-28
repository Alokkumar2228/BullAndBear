import express from 'express';
import { createOrder, getOrderById, deleteOrder } from '../controllers/orderController.js';
import { clerkAuth } from '../middleware/clerkAuth.js';

const router = express.Router();

router.post('/order/create',clerkAuth, createOrder);
router.post('/order/find',clerkAuth, getOrderById);
router.post('/order/delete',clerkAuth, deleteOrder);    

// router.post('/auth', authMiddleware);

export default router;
