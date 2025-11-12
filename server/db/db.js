import mongoose from 'mongoose';
import dotenv from 'dotenv';
import DailyPLHoldings from "../models/DailyPLHoldingsModel.js";


dotenv.config();

const adddata = async()=>{
  try{
    const newData = new DailyPLHoldings({
    user_id: "user123",
    date: "2023-10-01",
    totalPL: 1500,
  });
  await newData.save();
  }catch(err){
    console.error("Error adding data:", err.message);
  }
}

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await adddata();
    console.log("MongoDB connected");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

export default connectDB;
