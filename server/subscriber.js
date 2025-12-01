import { createClient } from "redis";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Transaction from "./models/TransactionModel.js";
import User from "./models/UserModel.js";
import userallOrder from "./models/userOrderModel.js";
import { getUsdInrRate } from "./utils/forex.js";

dotenv.config();

//   MongoDB connection with retry logic
async function connectMongoDB(retries = 5, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("  MongoDB connected");
      return;
    } catch (error) {
      console.error(`❌ MongoDB connection failed (${i + 1}/${retries}):`, error.message);
      if (i < retries - 1) {
        console.log(`🔁 Retrying MongoDB connection in ${delay / 1000}s...`);
        await new Promise((res) => setTimeout(res, delay));
      } else {
        console.error("❌ MongoDB connection failed after multiple attempts. Exiting...");
        process.exit(1);
      }
    }
  }
}

await connectMongoDB();

//   Redis connection with auto-reconnect
async function connectRedis() {
  const subscriber = createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      reconnectStrategy: (retries) => {
        console.log(`🔁 Redis reconnect attempt #${retries}`);
        return Math.min(retries * 1000, 10000); // wait up to 10s
      },
    },
  });

  subscriber.on("connect", () => console.log("  Redis Subscriber Client Connected"));
  subscriber.on("error", (err) => console.error("❌ Redis Subscriber Client Error:", err));

  // Auto reconnect handling for ECONNRESET
  subscriber.on("end", async () => {
    console.warn("⚠️ Redis connection ended. Attempting to reconnect...");
    setTimeout(connectRedis, 3000);
  });

  await subscriber.connect();

  //   Subscribe once after connection
  await subscriber.subscribe("stockSold", async (message) => {
    try {
      const data = JSON.parse(message);
      

      const {
        userId,
        quantity,
        sellPrice,
        symbol,
        name,
        mode,
        orderType,
        purchasePrice,
      } = data;

      if (!userId || !quantity || !sellPrice) {
        console.warn("⚠️ Missing required fields in stockSold event:", data);
        return;
      }

      const usdInrRate = await getUsdInrRate();
      const totalAmountInRupee = quantity * sellPrice * usdInrRate;
      const totalInvestmentRupee = quantity * purchasePrice * usdInrRate;

      // Update user balance and invested amount safely
      let updatedUser = await User.findOneAndUpdate(
        { user_id: userId },
        {
          $inc: {
            balance: totalAmountInRupee,
            investedAmount: -totalInvestmentRupee,
          },
        },
        { new: true }
      );

      if (!updatedUser) {
        console.warn(`⚠️ User not found for userId: ${userId}`);
        return;
      }

      // Ensure investedAmount doesn't go below 0
      if (updatedUser.investedAmount < 0) {
        updatedUser.investedAmount = 0;
        await updatedUser.save();
      }

      

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
      
    } catch (error) {
      console.error("❌ Error processing stockSold event:", error);
    }
  });

  // Graceful shutdown
  process.on("SIGINT", async () => {
   
    await subscriber.quit();
    await mongoose.disconnect();
    process.exit(0);
  });
}

await connectRedis();
