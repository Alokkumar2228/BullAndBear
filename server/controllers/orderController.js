import Order from "../models/OrderModel.js";
import User from "../models/UserModel.js";
import { getUsdInrRate } from "../utils/forex.js";
import yahooFinance from "yahoo-finance2";
import client from "../utils/redisclient.js";
import userallOrder from "../models/userOrderModel.js";
import mongoose from "mongoose";
import { sellSchema } from "../zod/sellStockSchema.js";

// Logging utility
const isDevelopment = process.env.NODE_ENV === "development";
const logger = {
  debug: (...args) => isDevelopment && console.log(...args),
  error: (...args) => console.error(...args),
  info: (...args) => isDevelopment && console.info(...args),
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
  const session = await mongoose.startSession();
  await session.startTransaction(); // ✅ ensure transaction starts properly

  try {
    const userId = req.user?.id;
    if (!userId) {
      await session.abortTransaction();
      await session.endSession();
      return res
        .status(401)
        .json({ message: "Unauthorized: No user ID found" });
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
      totalAmount,
      currency = "USD",
    } = req.body;

    // ✅ Validation
    if (
      !symbol ||
      !mode ||
      !quantity ||
      !purchasePrice ||
      !actualPrice ||
      !name ||
      !changePercent ||
      !totalAmount
    ) {
      await session.abortTransaction();
      await session.endSession();
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Numeric coercion
    const numericQuantity = Number(quantity);
    const numericPurchasePrice = Number(purchasePrice);
    const numericTotalAmount = Number(totalAmount);
    const numericActualPrice = Number(actualPrice);

    // ✅ Validate total
    const calculatedTotal = numericQuantity * numericPurchasePrice;
    if (Math.abs(calculatedTotal - numericTotalAmount) > 0.01) {
      await session.abortTransaction();
      await session.endSession();
      return res.status(400).json({
        message: "Invalid total amount",
        expected: calculatedTotal,
        received: numericTotalAmount,
      });
    }

    // ✅ Find user in transaction
    const user = await User.findOne({ user_id: userId }).session(session);
    if (!user) {
      await session.abortTransaction();
      await session.endSession();
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Currency conversion
    const normalizedCurrency = (currency || "USD").toUpperCase();
    const usdInrRate = await getUsdInrRate();
    const amountAtFillInGivenCurrency = numericQuantity * numericActualPrice;
    const requiredAmountInInr =
      normalizedCurrency === "USD"
        ? amountAtFillInGivenCurrency * usdInrRate
        : amountAtFillInGivenCurrency;

    if (user.balance < requiredAmountInInr) {
      await session.abortTransaction();
      await session.endSession();
      return res.status(400).json({
        message: `Insufficient balance. Required ₹${requiredAmountInInr.toFixed(
          2
        )}, Available ₹${Number(user.balance).toFixed(2)}`,
      });
    }

    // ✅ Market-hour validation
    if (orderType === "INTRADAY" && !isWithinMarketHours()) {
      await session.abortTransaction();
      await session.endSession();
      return res.status(400).json({
        message: "Intraday orders can only be placed during market hours",
      });
    }

    // ✅ Base order shared between both collections
    const baseOrder = {
      userId,
      orderId: `ORD-${Date.now()}`,
      symbol,
      name,
      mode,
      quantity: numericQuantity,
      purchasePrice: numericPurchasePrice,
      totalAmount: numericTotalAmount,
      actualPrice: numericActualPrice,
      changePercent,
      orderType,
      currency,
      status: "EXECUTED",
      executedAt: new Date(),
    };

    // ✅ Create both order entries
    const allOrdersEntry = new userallOrder(baseOrder);
    const userSpecificOrder = new Order({
      ...baseOrder,
      ...(orderType === "DELIVERY" && {
        settlementDate: calculateSettlementDate(),
        isSettled: false,
        inDematAccount: false,
      }),
    });

    // ✅ Save both in the same transaction
    await allOrdersEntry.save({ session });
    await userSpecificOrder.save({ session });

    // ✅ Deduct balance atomically
    user.balance = Number(user.balance) - requiredAmountInInr;
    await user.save({ session });

    // ✅ Commit and clean up
    await session.commitTransaction();
    await session.endSession();

    res.status(201).json({
      message: "Order created successfully",
      order: userSpecificOrder,
      newBalance: user.balance,
    });
  } catch (err) {
    // ✅ Rollback on any failure
    await session.abortTransaction();
    await session.endSession();
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
          headers: req.headers,
        },
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

    // console.log(`Found ${orders.length} orders for user ${userId}`);
    res.status(200).json(orders);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching order", error: err.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const userId = req?.user?.id;
    const orderTypeQuery = req.query.type;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No user ID found" });
    }

    const orders = await Order.find({ userId });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    const symbols = orders.map((order) => order.symbol);

    // 1️⃣ Check if live data is cached in Redis
    const cachedData = await client.get("userOrders");
    let liveData;

    if (cachedData) {
      liveData = JSON.parse(cachedData);
    } else {
      // 2️⃣ Fetch live data from Yahoo Finance if not cached
      const quotes = await yahooFinance.quote(symbols);

      liveData = quotes.map((q) => ({
        symbol: q.symbol,
        name: q.shortName,
        price: q.regularMarketPrice,
        change: q.regularMarketChange,
        changePercent: q.regularMarketChangePercent,
      }));

      // 3️⃣ Cache live data in Redis for 1 hour
      await client.set("userOrders", JSON.stringify(liveData), { EX: 3600 });
    }

    // 4️⃣ Update each order document with latest data and save
    const updatedOrders = [];
    for (const order of orders) {
      const live = liveData.find((l) => l.symbol === order.symbol);
      if (live) {
        order.actualPrice = live.price;
        order.changePercent = live.changePercent;
        await order.save(); // save changes to MongoDB
      }
      updatedOrders.push(order);
    }

    let filterOrders = updatedOrders;
    if (orderTypeQuery) {
      const orderTypes = orderTypeQuery
        .split(",")
        .map((type) => type.trim().toUpperCase());
      filterOrders = updatedOrders.filter((order) =>
        orderTypes.includes(order.orderType)
      );
    }

    return res.status(200).json(filterOrders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Update Order Status
export const updateOrderStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No user ID found" });
    }

    const { orderId, status } = req.body;
    if (!orderId || !status) {
      return res
        .status(400)
        .json({ message: "Order ID and status are required" });
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId, userId }, // Ensure user owns the order
      {
        status,
        executedAt: status === "EXECUTED" ? new Date() : null,
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(updatedOrder);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating order", error: err.message });
  }
};

// Square off intraday positions
export const squareOffIntraday = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No user ID found" });
    }

    const currentTime = new Date();
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();

    // Only run square-off after 3:20 PM (market closing at 3:30 PM)
    if (hours < 15 || (hours === 15 && minutes < 20)) {
      return res
        .status(400)
        .json({ message: "Square-off can only be done near market close" });
    }

    // Find all open intraday positions for this user
    const intradayPositions = await Order.find({
      userId,
      orderType: "INTRADAY",
      status: "EXECUTED",
      mode: "BUY", // Square off only buy positions
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
        executedAt: new Date(),
      });

      await sellOrder.save();
      return sellOrder;
    });

    const squaredOffOrders = await Promise.all(squareOffPromises);
    res.status(200).json(squaredOffOrders);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error squaring off positions", error: err.message });
  }
};

// Process delivery settlements (T+1)
export const processSettlements = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No user ID found" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all unsettled delivery orders due for settlement for this user
    const settlingOrders = await Order.find({
      userId,
      orderType: "DELIVERY",
      isSettled: false,
      settlementDate: { $lte: today },
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
    res
      .status(500)
      .json({ message: "Error processing settlements", error: err.message });
  }
};

// Delete Order
export const deleteOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No user ID found" });
    }

    const orderId = req.params.id;

    const deletedOrder = await Order.findOneAndDelete({
      _id: orderId,
      userId, // Ensure user owns the order
    });

    if (!deletedOrder) {
      return res
        .status(404)
        .json({ message: "Order not found or unauthorized" });
    }

    console.log(`Order ${orderId} deleted successfully by user ${userId}`);
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error("Delete order error:", err);
    res
      .status(500)
      .json({ message: "Error deleting order", error: err.message });
  }
};

//sell stock
export const sellStock = async (req, res) => {
  const parseResult = sellSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid input data",
      errors: parseResult.error.errors,
    });
  }

  const { symbol, quantity: sellQty, sellPrice, orderId } = parseResult.data.selldata;
  const userId = req?.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized: No user ID found" });
  }

  const session = await mongoose.startSession();
  await session.startTransaction();

  try {
    const order = await Order.findOne({ orderId }).session(session);

    if (!order) {
      await session.abortTransaction();
      await session.endSession();
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const quantity = Number(sellQty);
    if (isNaN(quantity) || quantity <= 0) {
      await session.abortTransaction();
      await session.endSession();
      return res.status(400).json({ success: false, message: "Invalid sell quantity" });
    }

    if (quantity > order.quantity) {
      await session.abortTransaction();
      await session.endSession();
      return res.status(400).json({ success: false, message: "Sell quantity exceeds owned quantity" });
    }

    const subscriberData = {
      userId,
      quantity,
      sellPrice,
      purchasePrice: order.purchasePrice,
      symbol: order.symbol,
      type: order.orderType,
      name: order.name,
      mode: "SELL",
    };

    // 🔹 If selling all
    if (quantity === order.quantity) {
      await Order.findOneAndDelete({ orderId }).session(session);
      await client.publish("stockSold", JSON.stringify(subscriberData));

      await session.commitTransaction();  // ✅ await added
      await session.endSession();

      return res.status(200).json({
        success: true,
        message: "Entire position sold and order deleted",
      });
    }

    // 🔹 Partial sale
    order.quantity -= quantity;
    order.totalAmount = order.quantity * order.purchasePrice;
    await order.save({ session });

    await client.publish("stockSold", JSON.stringify(subscriberData));

    await session.commitTransaction();  // ✅ await added
    await session.endSession();

    return res.status(200).json({
      success: true,
      message: "Stock sold successfully",
      updatedOrder: order,
    });

  } catch (error) {
    // ✅ Only abort if still in transaction
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    await session.endSession();

    console.error("❌ sellStock error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


export const getAllOrders = async (req, res) => {
  const userId = req?.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: No user ID found" });
  }

  try {
    const allOrders = await userallOrder.find({ userId });
    if (!allOrders || allOrders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }
    return res.status(200).json({ success: true, orders: allOrders });
  } catch (error) {
    console.error("Error fetching all user orders:", error);
  }
};

// export const updateOrderData = async(req,res) =>{
//
// const userId = req?.user?.id;
// const cachedData = await client.get('stocks');
//
//
//
// }
//
