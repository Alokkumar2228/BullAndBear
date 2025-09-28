import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  investedAmount: { type: Number, default: 0 },
  withdrawAmount: { type: Number, default: 0 },
  transactionStatus: { type: String, default: "false" },
});

const User = mongoose.model('User', userSchema);

export default User;
