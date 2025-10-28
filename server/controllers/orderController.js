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

// Helper: Calculate settlement date (T+1)
const calculateSettlementDate = () => {
  const settlementDate = new Date();
  settlementDate.setDate(settlementDate.getDate() + 1);
  while (settlementDate.getDay() === 0 || settlementDate.getDay() === 6) {
    settlementDate.setDate(settlementDate.getDate() + 1);
  }
  return settlementDate;
};

// Helper: Check market hours (9:15 – 3:30 IST)
const isWithinMarketHours = () => {
  const now = new Date();
  const timeInMinutes = now.getHours() * 60 + now.getMinutes();
  return timeInMinutes >= 555 && timeInMinutes <= 930;
};

// ✅ Create Order Controller
export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user?.id;
    if (!userId) {
      await session.abortTransaction();
      await session.endSession();
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
      orderMode = "MARKET",
      currency = "USD",
    } = req.body;

    // ✅ Validate input
    if (!symbol || !mode || !quantity || !purchasePrice || !actualPrice || !name || !changePercent) {
      await session.abortTransaction();
      await session.endSession();
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Numeric conversions
    const numericQuantity = Number(quantity);
    const numericPurchasePrice = Number(purchasePrice);
    const numericActualPrice = Number(actualPrice);

    if (isNaN(numericQuantity) || isNaN(numericPurchasePrice) || isNaN(numericActualPrice)) {
      await session.abortTransaction();
      await session.endSession();
      return res.status(400).json({ message: "Invalid numeric values" });
    }

    // ✅ Calculate amount
    const priceToUse = orderMode === "LIMIT" ? numericPurchasePrice : numericActualPrice;
    const totalAmount = numericQuantity * priceToUse;

    // ✅ Find user
    const user = await User.findOne({ user_id: userId }).session(session);
    if (!user) {
      await session.abortTransaction();
      await session.endSession();
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Currency conversion
    const usdInrRate = await getUsdInrRate();
    const requiredAmountInInr = currency.toUpperCase() === "USD"
      ? totalAmount * usdInrRate
      : totalAmount;

    // ✅ Balance check
    if (user.balance < requiredAmountInInr) {
      await session.abortTransaction();
      await session.endSession();
      return res.status(400).json({
        message: `Insufficient balance. Required ₹${requiredAmountInInr.toFixed(
          2
        )}, Available ₹${user.balance.toFixed(2)}.`,
      });
    }

    // // ✅ Intraday validation
    if (orderType === "INTRADAY" && !isWithinMarketHours()) {
      await session.abortTransaction();
      await session.endSession();
      return res.status(400).json({
        message: "Intraday orders can only be placed during market hours (9:15 AM - 3:30 PM IST)",
      });
    }

    // ✅ Base order object
    const baseOrder = {
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
    };

    // ✅ Create orders
    const allOrdersEntry = new userallOrder(baseOrder);
    const userSpecificOrder = new Order({
      ...baseOrder,
      ...(orderType === "DELIVERY" && {
        settlementDate: calculateSettlementDate(),
        isSettled: false,
        inDematAccount: false,
      }),
    });

    await allOrdersEntry.save({ session });
    await userSpecificOrder.save({ session });

    // ✅ Deduct balance
    user.balance = Number(user.balance) - requiredAmountInInr;
    user.investedAmount = (user.investedAmount || 0) + requiredAmountInInr;
    await user.save({ session });

    // ✅ Commit transaction
    await session.commitTransaction();
    await session.endSession();

    return res.status(201).json({ success: true,
      message: `Order placed successfully for ${numericQuantity} shares of ${symbol} at ${priceToUse.toFixed(
        2
      )} ${currency}.`,
      order: userSpecificOrder,
      newBalance: user.balance,
    });
  } catch (err) {
    await session.abortTransaction();
    await session.endSession();
    logger.error("Order creation failed:", err);
    return res.status(500).json({ message: "Error creating order", error: err.message });
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

export const getUserOrders = async (req, res) => {
  try {
    
    const userId = req?.user?.id;
    const orderTypeQuery = req.query.type;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No user ID found" });
    }
   
    const orders = await Order.find({userId});
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    const symbols = [...new Set(orders.map(o => o.symbol))];

    // 1️⃣ Check if live data is cached
    const cachedData = await client.get("userOrders");
    let liveData;

    if (cachedData) {
      liveData = JSON.parse(cachedData);
    } else {
      const quotes = await yahooFinance.quote(symbols);

      liveData = quotes.map(q => ({
        symbol: q.symbol,
        name: q.shortName,
        price: q.regularMarketPrice,
        change: q.regularMarketChange,
        changePercent: q.regularMarketChangePercent
      }));

      await client.set("userOrders", JSON.stringify(liveData), { EX: 3600 });
    }

    // 2️⃣ Create liveMap for O(1) lookup
    const liveMap = new Map(liveData.map(item => [item.symbol, item]));

    // 3️⃣ Prepare bulk update operations
    const bulkOps = [];
    for (const order of orders) {
      const live = liveMap.get(order.symbol);
      if (live) {
        order.actualPrice = live.price;          // update in memory for response
        order.changePercent = live.changePercent;

        bulkOps.push({
          updateOne: {
            filter: { orderId: order.orderId },  // unique order identifier
            update: { $set: { 
              actualPrice: live.price,
              changePercent: live.changePercent
            }}
          }
        });
      }
    }

    // 4️⃣ Perform all updates in a single bulkWrite
    if (bulkOps.length > 0) {
      await Order.bulkWrite(bulkOps);
    }

    // 5️⃣ Filter by order type if requested
    let filterOrders = orders;
    if (orderTypeQuery) {
      const orderTypes = orderTypeQuery.split(",").map(t => t.trim().toUpperCase());
      filterOrders = orders.filter(o => orderTypes.includes(o.orderType));
    }

    return res.status(200).json(filterOrders);

  } catch (error) {
    console.error("Error fetching user orders:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
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
  session.startTransaction();

  try {
    // 🔹 Fetch user's active order
    const order = await Order.findOne({ orderId }).session(session);
    if (!order) {
      throw new Error("Order not found");
    }

    const quantity = Number(sellQty);
    if (isNaN(quantity) || quantity <= 0) throw new Error("Invalid sell quantity");
    if (quantity > order.quantity) throw new Error("Sell quantity exceeds owned quantity");

    // 🔹 Currency conversion rate
    const usdInrRate = await getUsdInrRate();
    const totalSellValueInRupee = quantity * sellPrice * usdInrRate;
    const totalInvestmentRupee = quantity * order.purchasePrice * usdInrRate;

    // 🔹 Update user balance and invested amount atomically
    const updatedUser = await User.findOneAndUpdate(
      { user_id: userId },
      {
        $inc: {
          balance: totalSellValueInRupee,
          investedAmount: -totalInvestmentRupee,
        },
      },
      { new: true, session }
    );

    if (!updatedUser) throw new Error("User not found");

    // Prevent negative investedAmount
    if (updatedUser.investedAmount < 0) {
      updatedUser.investedAmount = 0;
      await updatedUser.save({ session });
    }

    // 🔹 If entire quantity sold → delete order
    if (quantity === order.quantity) {
      await Order.deleteOne({ orderId }).session(session);
    } else {
      // 🔹 Partial sale → reduce quantity & totalAmount
      order.quantity -= quantity;
      order.totalAmount = order.quantity * order.purchasePrice;
      await order.save({ session });
    }

    // 🔹 Record completed sell in userAllOrder collection
    const sellOrder = new userallOrder({
      userId,
      orderId: `ORD-${Date.now()}`,
      symbol,
      name: order.name,
      mode: "SELL",
      orderType: order.orderType,
      status: "EXECUTED",
      quantity,
      purchasePrice: order.purchasePrice,
      sellPrice,
      executedAt: new Date(),
    });

    await sellOrder.save({ session });

    // 🔹 Publish event for analytics/logs (optional)
    await client.publish(
      "stockSold",
      JSON.stringify({
        userId,
        symbol,
        quantity,
        sellPrice,
        purchasePrice: order.purchasePrice,
        orderType: order.orderType,
        name: order.name,
        mode: "SELL",
      })
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message:
        quantity === order.quantity
          ? "Entire position sold and order deleted"
          : "Stock sold successfully",
      updatedOrder: quantity === order.quantity ? null : order,
      updatedUser,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();

    console.error("❌ sellStock error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};



export const getAllOrders = async (req, res) => {
  const userId = req?.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: No user ID found" });
  }

  try {
    const allOrders = await userallOrder.find({ userId }).sort({ executedAt: -1 });
    if (!allOrders || allOrders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }
    return res.status(200).json({ success: true, orders: allOrders });
  } catch (error) {
    console.error("Error fetching all user orders:", error);
  }
};



