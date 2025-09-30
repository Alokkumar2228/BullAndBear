import express from 'express';
import { 
  createOrder, 
  getOrderById, 
  deleteOrder, 
  updateOrderStatus,
  squareOffIntraday,
  processSettlements
} from '../controllers/orderController.js';
import { clerkAuth } from '../middleware/clerkAuth.js';

const router = express.Router();

// Apply clerkAuth middleware to all routes
router.use(clerkAuth);

router.post('/create', createOrder);
router.post('/find', getOrderById);
router.post('/update-status', updateOrderStatus);
router.post('/delete', deleteOrder);
router.post('/square-off-intraday', squareOffIntraday);
router.post('/process-settlements', processSettlements);
 
export default router;
