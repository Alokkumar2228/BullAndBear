import mongoose from 'mongoose';

const dailyPLHoldingsSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true, index: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    totalPL: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

// ensure unique per-user per-day
dailyPLHoldingsSchema.index({ user_id: 1, date: 1 }, { unique: true });

const DailyPLHoldings = mongoose.model('DailyPLHoldings', dailyPLHoldingsSchema, 'DailyPLsOfHolding');

export default DailyPLHoldings;
