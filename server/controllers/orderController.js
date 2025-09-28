import Order from '../models/OrderModel.js';
import Cookies from 'cookies';
import jwt from 'jsonwebtoken';

// Helper function to calculate settlement date (T+1)
const calculateSettlementDate = () => {
  const settlementDate = new Date();
  settlementDate.setDate(settlementDate.getDate() + 1);
  // Skip weekends
  while (settlementDate.getDay() === 0 || settlementDate.getDay() === 6) {
    settlementDate.setDate(settlementDate.getDate() + 1);
  }
  return settlementDate;
};

// Helper function to check market hours
const isWithinMarketHours = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const timeInMinutes = hours * 60 + minutes;
  
  // Market hours: 9:15 AM to 3:30 PM
  return timeInMinutes >= 555 && timeInMinutes <= 930;
};

// Create Order
export const createOrder = async (req, res) => {
  const publicKey = process.env.CLERK_PEM_PUBLIC_KEY;
  if (!publicKey) {
    return res.status(500).json({ error: 'Clerk public key not set in environment' });
  }

  const cookies = new Cookies(req, res);
  const tokenFromCookie = cookies.get('__session');
  const tokenFromHeader = req.headers.authorization
    ? req.headers.authorization.split(' ')[1]
    : null;

  const token = tokenFromCookie || tokenFromHeader;
  if (!token) return res.status(401).json({ error: 'Not signed in' });

  try {
    const options = { algorithms: ['RS256'] };
    const decoded = jwt.verify(token, publicKey, options);
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) throw new Error('Token expired');
    if (decoded.nbf && decoded.nbf > currentTime) throw new Error('Token not valid yet');

    const userId = decoded.sub;
    if (!userId) return res.status(401).json({ error: "Invalid token: missing user ID" });

    const { 
      symbol, 
      mode, 
      quantity, 
      purchasePrice, 
      actualPrice, 
      name, 
      changePercent,
      orderType = "DELIVERY",
      status = "PENDING"
    } = req.body;

    if (!symbol || !mode || !quantity || !purchasePrice || !actualPrice || !name || !changePercent) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const totalAmount = quantity * purchasePrice;

    // Additional validations for order types
    if (orderType === "INTRADAY" && !isWithinMarketHours()) {
      return res.status(400).json({ message: "Intraday orders can only be placed during market hours" });
    }

    const newOrder = new Order({
      userId,
      symbol,
      name,
      mode,
      quantity,
      purchasePrice,
      totalAmount,
      actualPrice,
      changePercent,
      orderType,
      status,
      // Set settlement details for delivery orders
      ...(orderType === "DELIVERY" && {
        settlementDate: calculateSettlementDate(),
        isSettled: false,
        inDematAccount: false
      })
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);

  } catch (err) {
    res.status(500).json({ message: "Error creating order", error: err.message });
  }
};

// Get Orders by User ID
export const getOrderById = async (req, res) => {
  const publicKey = process.env.CLERK_PEM_PUBLIC_KEY;
  if (!publicKey) {
    return res.status(500).json({ error: 'Clerk public key not set in environment' });
  }

  const cookies = new Cookies(req, res);
  const tokenFromCookie = cookies.get('__session');
  const tokenFromHeader = req.headers.authorization
    ? req.headers.authorization.split(' ')[1]
    : null;

  const token = tokenFromCookie || tokenFromHeader;
  if (!token) return res.status(401).json({ error: 'Not signed in' });

  try {
    const options = { algorithms: ['RS256'] };
    const decoded = jwt.verify(token, publicKey, options);
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) throw new Error('Token expired');
    if (decoded.nbf && decoded.nbf > currentTime) throw new Error('Token not valid yet');

    const userId = decoded.sub;
    if (!userId) return res.status(401).json({ error: "Invalid token: missing user ID" });

    const { orderType } = req.body;
    let query = { userId };

    // Filter by orderType if provided
    if (orderType) {
      if (Array.isArray(orderType)) {
        query.orderType = { $in: orderType };
      } else {
        query.orderType = orderType;
      }
    }

    const orders = await Order.find(query);
    if (!orders || orders.length === 0) return res.status(404).json({ message: "Order not found" });

    res.status(200).json(orders);

  } catch (err) {
    res.status(500).json({ message: "Error fetching order", error: err.message });
  }
};

// Update Order Status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    if (!orderId || !status) {
      return res.status(400).json({ message: "Order ID and status are required" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { 
        status,
        executedAt: status === 'EXECUTED' ? new Date() : null
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: "Error updating order", error: err.message });
  }
};

// Square off intraday positions
export const squareOffIntraday = async (req, res) => {
  try {
    const currentTime = new Date();
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();

    // Only run square-off after 3:20 PM (market closing at 3:30 PM)
    if (hours < 15 || (hours === 15 && minutes < 20)) {
      return res.status(400).json({ message: "Square-off can only be done near market close" });
    }

    // Find all open intraday positions
    const intradayPositions = await Order.find({
      orderType: "INTRADAY",
      status: "EXECUTED",
      mode: "BUY" // Square off only buy positions
    });

    const squareOffPromises = intradayPositions.map(async (position) => {
      // Create corresponding SELL order for each position
      const sellOrder = new Order({
        userId: position.userId,
        symbol: position.symbol,
        name: position.name,
        mode: "SELL",
        quantity: position.quantity,
        purchasePrice: position.actualPrice, // Use current price as sell price
        totalAmount: position.quantity * position.actualPrice,
        actualPrice: position.actualPrice,
        changePercent: position.changePercent,
        orderType: "INTRADAY",
        status: "EXECUTED",
        executedAt: new Date()
      });

      await sellOrder.save();
      return sellOrder;
    });

    const squaredOffOrders = await Promise.all(squareOffPromises);
    res.status(200).json(squaredOffOrders);
  } catch (err) {
    res.status(500).json({ message: "Error squaring off positions", error: err.message });
  }
};

// Process delivery settlements (T+1)
export const processSettlements = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all unsettled delivery orders due for settlement
    const settlingOrders = await Order.find({
      orderType: "DELIVERY",
      isSettled: false,
      settlementDate: { $lte: today }
    });

    const settlementPromises = settlingOrders.map(async (order) => {
      order.isSettled = true;
      order.inDematAccount = true;
      return order.save();
    });

    const settledOrders = await Promise.all(settlementPromises);
    res.status(200).json(settledOrders);
  } catch (err) {
    res.status(500).json({ message: "Error processing settlements", error: err.message });
  }
};

// Delete Order
export const deleteOrder = async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) return res.status(404).json({ message: "Order not found" });

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting order", error: err.message });
  }
};
