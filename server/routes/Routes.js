import express from 'express';
import { createOrder, getOrderById, deleteOrder } from '../controllers/orderController.js';

const router = express.Router();

router.post('/order/create', createOrder);
router.post('/order/find', getOrderById);
router.post('/order/delete', deleteOrder);
// router.post('/auth', authMiddleware);

export default router;
