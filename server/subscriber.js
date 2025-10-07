import { createClient } from "redis";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Transaction from "./models/TransactionModel.js";
import User from "./models/UserModel.js";
import userallOrder from "./models/userOrderModel.js";
import { getUsdInrRate } from "./utils/forex.js";

dotenv.config();

// Connect to MongoDB
await mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
console.log("✅ MongoDB connected");

// Connect to Redis
const subscriber = createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

subscriber.on("error", (err) =>
  console.error("❌ Redis Subscriber Client Error:", err)
);

subscriber.on("connect", () =>
  console.log("✅ Redis Subscriber Client Connected")
);

await subscriber.connect();

// Subscribe once
await subscriber.subscribe("stockSold", async (message) => {
  try {
    const data = JSON.parse(message);
    console.log("📩 Received stock sold event:", data);

    const { userId, quantity, sellPrice, symbol, name,mode, orderType, purchasePrice } = data;
    if (!userId || !quantity || !sellPrice) {
      console.warn("⚠️ Missing required fields in stockSold event:", data);
      return;
    }

    // Get USD → INR rate
    const usdInrRate = await getUsdInrRate();
    const totalAmountInRupee = quantity * sellPrice * usdInrRate;

    // Update user balance and invested amount
    const updatedUser = await User.findOneAndUpdate(
      { user_id: userId },
      {
        $inc: {
          balance: totalAmountInRupee,
          investedAmount: -totalAmountInRupee,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      console.warn(`⚠️ User not found for userId: ${userId}`);
      return;
    }

    console.log(`✅ Updated user ${userId}: balance = ${updatedUser.balance}`);

    // Save sell order
    const sellOrder = new userallOrder({
      userId,
      orderId: `ORD-${Date.now()}`,
      symbol,
      name,
      mode,
      orderType,
      status: "EXECUTED",
      quantity,
      purchasePrice,
      sellPrice,
      executedAt: new Date(),
    });

    await sellOrder.save();
    console.log("💾 Sell order saved:", sellOrder.orderId);

  } catch (error) {
    console.error("❌ Error processing stockSold event:", error);
  }
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🧹 Closing Redis and MongoDB connections...");
  await subscriber.quit();
  await mongoose.disconnect();
  process.exit(0);
});
