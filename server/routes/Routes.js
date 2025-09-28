import express from 'express';

import { 
  createOrder, 
  getOrderById, 
  deleteOrder, 
  updateOrderStatus,
  squareOffIntraday,
  processSettlements
} from '../controllers/orderController.js';

const router = express.Router();

router.post('/order/create', createOrder);
router.post('/order/find', getOrderById);
router.post('/order/update-status', updateOrderStatus);
router.post('/order/delete', deleteOrder);
router.post('/order/square-off-intraday', squareOffIntraday);
router.post('/order/process-settlements', processSettlements);

import { createOrder, getOrderById, deleteOrder } from '../controllers/orderController.js';
import { clerkAuth } from '../middleware/clerkAuth.js';

const router = express.Router();

router.post('/order/create',clerkAuth, createOrder);
router.post('/order/find',clerkAuth, getOrderById);
router.post('/order/delete',clerkAuth, deleteOrder);    


// router.post('/auth', authMiddleware);

export default router;
