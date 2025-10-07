
import Order from '../models/OrderModel.js';
import User from '../models/UserModel.js';
import { getUsdInrRate } from '../utils/forex.js';
import yahooFinance from 'yahoo-finance2';
import client from '../utils/redisclient.js';

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
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized: No user ID found" });

    const {
      symbol,
      mode,
      quantity,
      purchasePrice, // user-selected price (LIMIT) or market price (MARKET)
      actualPrice,   // real-time market price
      name,
      changePercent,
      orderType = "DELIVERY",
      orderMode = "MARKET",
      currency = "USD",
    } = req.body;

    if (!symbol || !mode || !quantity || !purchasePrice || !actualPrice || !name || !changePercent) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const numericQuantity = Number(quantity);
    const numericPurchasePrice = Number(purchasePrice);
    const numericActualPrice = Number(actualPrice);

    // Calculate required amount based on order mode
    const priceToUse = orderMode === "LIMIT" ? numericPurchasePrice : numericActualPrice;
    const totalAmount = numericQuantity * priceToUse;

    // Fetch user balance
    const user = await User.findOne({ user_id: userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    const usdInrRate = await getUsdInrRate();
    const requiredAmountInInr = currency.toUpperCase() === "USD"
      ? totalAmount * usdInrRate
      : totalAmount;

    if (user.balance < requiredAmountInInr) {
      return res.status(400).json({
        message: `Insufficient balance. You need ₹${requiredAmountInInr.toFixed(2)} but your balance is ₹${user.balance.toFixed(2)}.`,
      });
    }

    // Additional validations for order types
    // if (orderType === "INTRADAY" && !isWithinMarketHours()) {
    //   return res.status(400).json({ message: "Intraday orders can only be placed during market hours (9:15 AM - 3:30 PM IST)" });
    // }

    const newOrder = new Order({
      userId,
      orderId: `ORD-${Date.now()}`,
      symbol,
      name,
      mode,
      quantity: numericQuantity,
      purchasePrice: numericPurchasePrice,
      actualPrice: numericActualPrice,
      totalAmount,
      changePercent,
      orderType,
      currency,
      orderMode,
      status: "EXECUTED",
      executedAt: new Date(),
      ...(orderType === "DELIVERY" && {
        settlementDate: calculateSettlementDate(),
        isSettled: false,
        inDematAccount: false,
      }),
    });

    const savedOrder = await newOrder.save();

    // Deduct balance
    user.balance = Number(user.balance) - requiredAmountInInr;
    await user.save();

    res.status(201).json({
      message: `Order placed successfully for ${numericQuantity} shares of ${symbol} at ${priceToUse.toFixed(2)} ${currency}.`,
      order: savedOrder,
      newBalance: user.balance,
    });
  } catch (err) {
    res.status(500).json({ message: "Error creating order", error: err.message });
  }
};

// Get Orders by User ID
export const getOrderById = async (req, res) => {
  try {

    
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

   
    const orders = await Order.find(query);

    // Return empty array instead of 404 when no orders found
    if (!orders || orders.length === 0) {
      return res.status(200).json([]);
    }

    
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

    
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {

    res.status(500).json({ message: "Error deleting order", error: err.message });
  }
};

//sell stock
export const sellStock = async (req, res) => {
  try {
    const { symbol, quantity, sellPrice, orderId } = req.body;
    const userId = req?.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No user ID found" });
    }

    const order = await Order.findOne({ orderId: orderId }); // fixed: _id not orderId field
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // if selling all
    if (order.quantity === quantity) {
      // delete order
      await Order.findOneAndDelete({orderId:orderId});
      return res.status(200).json({ success: true, message: "Entire position sold and order deleted" });
    }

    // if partial sale
    if (quantity > order.quantity) {
      return res.status(400).json({ success: false, message: "Sell quantity exceeds owned quantity" });
    }

    order.quantity -= quantity;
    order.totalAmount = order.quantity * order.purchasePrice;
    order.executedAt = new Date();

    await order.save();

    const stockSymbol = order.symbol;
    const quote = await yahooFinance.quote({
      symbol: stockSymbol,
      modules: ['price'] 
    });
    const currentMarketPrice = quote.price.regularMarketPrice;
    logger.info(`Current market price for ${stockSymbol} is ${currentMarketPrice}`);

    const newSellorder = new Order({
      userId,
      orderId: `ORD-${Date.now()}`, 
      symbol: order.symbol,
      name: order.name,
      mode: "SELL",
      quantity: quantity,
      purchasePrice: order.purchasePrice,
      totalAmount: quantity * currentMarketPrice,
      actualPrice: currentMarketPrice,
      changePercent: ((currentMarketPrice - order.purchasePrice) / order.purchasePrice) * 100,
      orderType: order.orderType,
      status: "EXECUTED",
      executedAt: new Date(),
    });

    await newSellorder.save();

    await client.publish(
      'stockSold',
      JSON.stringify({ userId,quantity, sellPrice : currentMarketPrice })
    );

    return res.status(200).json({
      success: true,
      message: "Stock sold successfully",
      updatedOrder: order,
      sellTransaction
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


