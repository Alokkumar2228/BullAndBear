import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  user_id: { type: String, required: true },       // your app’s user
  transaction_id: { type: String, required: true, unique: true }, // Razorpay payment id
  order_id: { type: String },                      // Razorpay order id
  type: { type: String, required: true },          // card, upi, netbanking
  amount: { type: Number, required: true },        // INR
  currency: { type: String, default: "INR" },
  status: { type: String },                        // captured, failed, refunded
  email: { type: String },
  contact: { type: String },
  notes: { type: Object },                         // store Razorpay notes (flexible)
  createdAt: { type: Date, default: Date.now },
  mode : {type:String},
});

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
