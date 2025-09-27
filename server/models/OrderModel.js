import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
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
