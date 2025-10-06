import crypto from "crypto";
import Razorpay from "razorpay";
import User from "../models/UserModel.js";
import Transaction from "../models/TransactionModel.js"; 
import Cookies from "cookies";
import jwt from "jsonwebtoken";
import sendPaymentSMS from "../utils/twilio.js";

const createOrder = async (req, res) => {
  try {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const { amount, currency, receipt, notes } = req.body;

    if (!amount || !currency || !notes || !receipt) {
      return res.status(400).json({
        success: false,
        message: "Please provide amount, currency, receipt, and notes",
      });
    }

    const options = {
      amount: amount , 
      currency,
      receipt,
      notes: notes || {},
    };

    const order = await instance.orders.create(options);

    if (!order) {
      return res
        .status(400)
        .json({ success: false, message: "Order creation failed" });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Order creation failed:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating Razorpay order",
      error: error.message,
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Step 1: Verify Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    
    const userId = req.user.id;

    // Step 2: Fetch payment details from Razorpay (for actual amount)
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (!payment || payment.status !== "captured") {
      return res.status(400).json({ success: false, message: "Payment not captured" });
    }

    // Step 4: Respond success
    res.json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};


const capturePayment = async(req,res) =>{

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  const shasum = crypto.createHmac("sha256", secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  if (digest === req.headers["x-razorpay-signature"]) {

    const event = req.body.event;

    if (event === "payment.captured") {
      const payment = req.body.payload.payment.entity;
       console.log(payment);
      const authToken = payment.notes.auth_token;
       // Decode Token
      const publicKey = process.env.CLERK_PEM_PUBLIC_KEY;
      if (!publicKey) {
        return res
          .status(500)
          .json({ error: "Clerk public key not set in environment" });
       }

      // Get token from cookies or headers
      const cookies = new Cookies(req, res);
      const tokenFromCookie = cookies.get("__session");
      const tokenFromNotes = authToken || null;

      const token = tokenFromCookie || tokenFromNotes;
      if (!token) return res.status(401).json({ error: "Not signed in" });

      // Verify token
      const options = { algorithms: ["RS256"] };
      const decoded = jwt.verify(token, publicKey, options);

      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < currentTime)
        throw new Error("Token expired");
      if (decoded.nbf && decoded.nbf > currentTime)
        throw new Error("Token not valid yet");

      const userId = decoded.sub;

      console.log("UserId",userId);

      const user = await User.findOne({ user_id: userId });
      if (!user) {
        return res.status(404).json({
          message: "User not found. If any amount deducted it will be refunded in 2-3 business days",
        });
      }
      user.balance += payment.amount / 100;
      user.transactionStatus = "paid";
      await user.save();
      // console.log("Payment captured via webhook:", payment);

      // Extract user + transaction details
      const transactionData = {
        user_id: userId,
        transaction_id: payment.id,
        order_id: payment.order_id,
        type: payment.method,
        amount:payment.amount / 100,
        currency: payment.currency,
        status: payment.status, // "captured"
        email: payment.email,
        contact: payment.contact,
        notes: payment.notes,
        createdAt: new Date(payment.created_at * 1000),
        mode:"credit"
      };

      // Save to DB
      const newTransaction = new Transaction(transactionData);
      await newTransaction.save();

      // Send payment success SMS
       // Send SMS notification
       console.log("Payment contact:", payment.contact);
      if (payment.contact) {
        await sendPaymentSMS(payment.contact, payment.amount / 100);
      }
      console.log("Transaction saved:", newTransaction);
    
    }
    else if(event === "payment.failed"){
      const payment = req.body.payload.payment.entity;
      // console.log(payment);
      const authToken = payment.notes.auth_token;
       // Decode Token
      const publicKey = process.env.CLERK_PEM_PUBLIC_KEY;
      if (!publicKey) {
        return res
          .status(500)
          .json({ error: "Clerk public key not set in environment" });
       }

      // Get token from cookies or headers
      const cookies = new Cookies(req, res);
      const tokenFromCookie = cookies.get("__session");
      const tokenFromNotes = authToken || null;

      const token = tokenFromCookie || tokenFromNotes;
      if (!token) return res.status(401).json({ error: "Not signed in" });

      // Verify token
      const options = { algorithms: ["RS256"] };
      const decoded = jwt.verify(token, publicKey, options);

      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < currentTime)
        throw new Error("Token expired");
      if (decoded.nbf && decoded.nbf > currentTime)
        throw new Error("Token not valid yet");

      const userId = decoded.sub;
      // Extract user + transaction details
      const transactionData = {
        user_id: userId,
        transaction_id: payment.id,
        order_id: payment.order_id,
        type: payment.method,
        amount:payment.amount / 100,
        currency: payment.currency,
        status: payment.status, // "captured"
        email: payment.email,
        contact: payment.contact,
        createdAt: new Date(payment.created_at * 1000),
        mode: "Credit"
      };

      // Save to DB
      const newTransaction = new Transaction(transactionData);
      await newTransaction.save();

      // console.log("Transaction saved:", newTransaction);
      console.log("Payment failed via webhook:", payment);
    }

    res.status(200).json({ status: "ok" });
  } else {
    res.status(400).json({ status: "invalid signature" });
  }
}

const getTransactionData = async (req, res) => {
  try {
    const userId = req.user.id;

    const transactions = await Transaction.find(
      { user_id: userId },
      {
        transaction_id: 1,
        amount: 1,
        status: 1,
        type: 1,
        createdAt: 1,
        mode: 1,
      }
    )
      .sort({ createdAt: -1 }); // 👈 Sort by date descending (newest first)

    res.status(200).json({ success: true, transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const withdrawOrder = async(req,res) =>{
  const {account_number,ifsc,amount} = req.body;
  const userId  = req.user.id;
  const user = await User.findOne({user_id: userId});
  if(!user){
    return res.status(404).json({success:false,message:"User not found"});
  }
  if(user.balance < amount){
    return res.status(400).json({success:false,message:"Insufficient balance"});
  }
  user.balance -= amount;
  user.withdrawAmount += amount;
  await user.save();

  const newTransaction = new Transaction({
    user_id: userId,
    transaction_id: `rz_${Date.now()}`,
    type: "withdrawal",
    amount: amount,
    currency: "INR",
    status: "processed",
    notes: {account_number,ifsc},
    createdAt: new Date(),
    mode:"debit"
  });
  await newTransaction.save();
  res.status(200).json({success:true,message:"Withdrawal processed",transaction:newTransaction});

}





export {createOrder,verifyPayment,capturePayment,getTransactionData,withdrawOrder};


