import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  orderId:{
    type: String,
    required: true,
    unique: true
  },
  symbol: {
    type: String,
    required: true
  },
  isSettled: {
    type: Boolean,
    default: false
  },
  settlementDate: {
    type: Date,
    default: null
  },
  inDematAccount: {
    type: Boolean,
    default: false
  },
  name: {
    type: String,
    required: true
  },
  mode: {
    type: String,
    enum: ["BUY", "SELL"],
    required: true
  },
  orderType: {
    type: String,
    enum: ["INTRADAY", "DELIVERY", "FNO"],
    required: true,
    default: "DELIVERY"
  },
  status: {
    type: String,
    enum: ["PENDING", "EXECUTED", "CANCELLED"],
    required: true,
    default: "EXECUTED"
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  purchasePrice: {
    type: Number,
    required: true
  },
  actualPrice: {
    type: Number,
    required: true
  },
  changePercent: {
    type: Number,
    required: true
  },
  placedAt: {
    type: Date,
    default: Date.now
  },
  executedAt: {
    type: Date,
    default: null
  },
  totalAmount: {
    type: Number,
    required: true
  }
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
