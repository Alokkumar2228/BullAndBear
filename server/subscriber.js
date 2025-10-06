import { createClient } from "redis";
import dotenv from "dotenv";
import Transaction from "./models/TransactionModel.js";
import User from "./models/UserModel.js";
dotenv.config();

const subscriber = createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

subscriber.on("error", (err) =>
  console.error(" Redis Subscriber Client Error:", err)
);
subscriber.on("connect", () =>
  console.log(" Redis Subscriber Client Connected")
);

await subscriber.connect();

await subscriber.subscribe("stockSold", async (message) => {
  try {
    const data = JSON.parse(message);
    console.log("Received stock sold event:", data);

    const { userId, quantity, sellPrice } = data;
    const totalAmount = quantity * sellPrice;

    const transaction = await Transaction.findOne({ user_id: userId });

    if (!transaction) {
      console.warn(
        `⚠️ Transaction not found for user: ${userId}. Skipping update.`
      );
      return;
    }

    // Update existing transaction
    transaction.amount += totalAmount;
    await transaction.save();

    const updatedUser = await User.findOneAndUpdate(
      { user_id: userId }, // find condition
      {
        $inc: {
          balance: totalAmount, // increase balance
          investedAmount: -totalAmount, // decrease investedAmount
        },
      },
      { new: true } // return the updated document
    );

    if (!updatedUser) {
      console.warn(
        `User not found for user: ${userId}. Skipping balance update.`
      );
      return;
    }

    console.log(
      `✅ Updated user ${userId}: new balance = ${updatedUser.balance}`
    );

    console.log(
      `Transaction updated for user: ${userId}, added amount: ${totalAmount}`
    );
  } catch (error) {
    console.error("Error processing stockSold event:", error);
  }
});
