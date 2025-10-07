import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  orderId:{
    type: String,
    unique: true,
    required: true
  },
  symbol: {
    type: String,
    required: true
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
 
  sellPrice :{
    type: Number,
    default: null
  },
  placedAt: {
    type: Date,
    default: Date.now
  },
  executedAt: {
    type: Date,
    default: null
  },
});

const userallOrder = mongoose.model('userOrder', orderSchema);

export default userallOrder;
