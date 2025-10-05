
import Order from '../models/OrderModel.js';
import User from '../models/UserModel.js';
import { getUsdInrRate } from '../utils/forex.js';

// Logging utility
const isDevelopment = process.env.NODE_ENV === 'development';
const logger = {
  debug: (...args) => isDevelopment && console.log(...args),
  error: (...args) => console.error(...args),
  info: (...args) => isDevelopment && console.info(...args)
};

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
  try {
    const userId = req.user?.id; // comes from clerkAuth middleware
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No user ID found" });
    }

    const { 
      symbol, 
      mode, 
      quantity, 
      purchasePrice, 
      actualPrice, 
      name, 
      changePercent,
      orderType = "DELIVERY",
      status = "PENDING",
      totalAmount,
      currency = "USD"
    } = req.body;


    if (!symbol || !mode || !quantity || !purchasePrice || !actualPrice || !name || !changePercent || !totalAmount) {
      return res.status(400).json({ 
        message: "All fields are required",
        missing: Object.entries({ symbol, mode, quantity, purchasePrice, actualPrice, name, changePercent, totalAmount })
          .filter(([_, value]) => value == null || value === undefined || value === '')
          .map(([key]) => key)
      });
    }

    // Coerce numeric inputs in case they arrive as strings
    const numericQuantity = Number(quantity);
    const numericPurchasePrice = Number(purchasePrice);
    const numericTotalAmount = Number(totalAmount);
    const numericActualPrice = Number(actualPrice);

    // Verify totalAmount calculation in the provided currency
    const calculatedTotal = numericQuantity * numericPurchasePrice;
    if (Math.abs(calculatedTotal - numericTotalAmount) > 0.01) { // Allow for small floating point differences
      return res.status(400).json({ 
        message: "Invalid total amount",
        expected: calculatedTotal,
        received: numericTotalAmount
      });
    }

    // Fetch user to check INR balance
    const user = await User.findOne({ user_id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Convert required amount to INR if price is in USD.
    // Deduction should be based on actual trade price.
    const normalizedCurrency = (currency || 'USD').toString().toUpperCase();
    const usdInrRate = await getUsdInrRate();
    const amountAtFillInGivenCurrency = numericQuantity * numericActualPrice;
    const requiredAmountInInr = normalizedCurrency === 'USD'
      ? amountAtFillInGivenCurrency * usdInrRate
      : amountAtFillInGivenCurrency;

    if (user.balance < requiredAmountInInr) {
      return res.status(400).json({
        message: `Insufficient balance. Required ₹${requiredAmountInInr.toFixed(2)}, Available ₹${Number(user.balance).toFixed(2)}`
      });
    }


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
      currency,
      // Automatically set status and executedAt
      status: "EXECUTED",
      executedAt: new Date(),
      // Set settlement details for delivery orders
      ...(orderType === "DELIVERY" && {
        settlementDate: calculateSettlementDate(),
        isSettled: false,
        inDematAccount: false
      })
    });

    const savedOrder = await newOrder.save();

    // Deduct user balance now that order is placed
    user.balance = Number(user.balance) - requiredAmountInInr;
    await user.save();

    res.status(201).json({ order: savedOrder, newBalance: user.balance });           
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating order", error: err.message });
  }
};

// Get Orders by User ID
export const getOrderById = async (req, res) => {
  try {
    // console.log('Request user object:', req.user);
    // console.log('Request headers:', req.headers);
    
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        message: "Unauthorized: No user ID found",
        debug: { 
          user: req.user,
          headers: req.headers
        }
      });
    }

    const { orderType, isSettled, inDematAccount } = req.body; // Changed to req.body as we're using POST
    let query = { userId };

    // Filter by orderType if provided
    if (orderType) {
      if (Array.isArray(orderType)) {
        query.orderType = { $in: orderType };
      } else {
        query.orderType = orderType;
      }
    }

    // Add settlement and demat account filters if provided
    if (isSettled !== undefined) {
      query.isSettled = isSettled;
    }
    if (inDematAccount !== undefined) {
      query.inDematAccount = inDematAccount;
    }

    // console.log("Fetching orders with query:", query);
    const orders = await Order.find(query);

    // Return empty array instead of 404 when no orders found
    if (!orders || orders.length === 0) {
      return res.status(200).json([]);
    }

    console.log(`Found ${orders.length} orders for user ${userId}`);
    res.status(200).json(orders);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching order", error: err.message });
  }
};

// Update Order Status
export const updateOrderStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No user ID found" });
    }

    const { orderId, status } = req.body;
    if (!orderId || !status) {
      return res.status(400).json({ message: "Order ID and status are required" });
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId, userId }, // Ensure user owns the order
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
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No user ID found" });
    }

    const currentTime = new Date();
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();

    // Only run square-off after 3:20 PM (market closing at 3:30 PM)
    if (hours < 15 || (hours === 15 && minutes < 20)) {
      return res.status(400).json({ message: "Square-off can only be done near market close" });
    }

    // Find all open intraday positions for this user
    const intradayPositions = await Order.find({
      userId,
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
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No user ID found" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all unsettled delivery orders due for settlement for this user
    const settlingOrders = await Order.find({
      userId,
      orderType: "DELIVERY",
      isSettled: false,
      settlementDate: { $lte: today }
    });

    if (settlingOrders.length === 0) {
      return res.status(404).json({ message: "No orders pending settlement" });
    }

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
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No user ID found" });
    }

    const orderId = req.params.id;
    
    const deletedOrder = await Order.findOneAndDelete({
      _id: orderId,
      userId // Ensure user owns the order
    });

    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found or unauthorized" });
    }

    console.log(`Order ${orderId} deleted successfully by user ${userId}`);
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error("Delete order error:", err);
    res.status(500).json({ message: "Error deleting order", error: err.message });
  }
};