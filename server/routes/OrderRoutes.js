import express from 'express';
import { 
  createOrder, 
  getOrderById, 
  updateOrderStatus,
  squareOffIntraday,
  processSettlements,
  sellStock
} from '../controllers/orderController.js';
import { clerkAuth } from '../middleware/clerkAuth.js';

const router = express.Router();

// Apply clerkAuth middleware to all routes
router.use(clerkAuth);

router.post('/create', createOrder);
router.post('/find', getOrderById);
router.post('/update-status', updateOrderStatus);
router.post('/square-off-intraday', squareOffIntraday);
router.post('/process-settlements', processSettlements);
// router.put('/order-update-data',updateOrderData);

//selling the stocks

router.post('/sell-order', sellStock);





 
export default router;
