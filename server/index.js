import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './db/db.js';
import OrderRouter from './routes/OrderRoutes.js';
import yahooFinance from 'yahoo-finance2';
import authRouter from './routes/authRoutes.js';
import client from './utils/redisclient.js';
import paymentRouter from './routes/paymentRoutes.js';
import userRouter from './routes/userRoutes.js';

const app = express();
const PORT = process.env.PORT || 8000;

// Normal middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Connect DB
connectDB();

// Stock symbols
const symbols = [
  "AAPL", "MSFT", "GOOGL", "AMZN", "META",
  "TSLA", "NVDA", "NFLX", "ADBE", "ORCL",
  "INTC", "AMD", "IBM", "CSCO", "QCOM",
  "SAP", "CRM", "NOW", "SNOW", "PLTR",
  "V", "MA", "PYPL", "SQ", "AXP",
  "COIN", "INTU", "FIS", "FISV", "GPN",
  "SHOP", "MELI", "WMT", "COST", "TGT",
  "BABA", "JD", "PDD", "EBAY", "ETSY",
  "UBER", "LYFT", "DAL", "UAL", "AAL",
  "BA", "RCL", "CCL", "MAR", "ABNB",
  "NKE", "MCD", "SBUX", "KO", "PEP",
  "PG", "UL", "CL", "KMB", "GIS",
  "XOM", "CVX", "BP", "SHEL", "COP",
  "DUK", "NEE", "SO", "ENPH", "FSLR",
  "JPM", "GS", "MS", "BAC", "WFC",
  "C", "BLK", "SCHW", "TROW", "SPGI",
  "PFE", "JNJ", "MRK", "ABBV", "LLY",
  "UNH", "BMY", "AMGN", "GILD", "CVS",
  "DIS", "PARA", "ROKU", "WBD", "SONY",
  "TTWO", "EA", "MTCH", "SPOT", "ZM"
];



// ✅ Stocks route
app.get("/api/stocks", async (req, res) => {
  try {

    const cachedData = await client.get('stocks');
    if(cachedData){
      return res.json(JSON.parse(cachedData));
    }

    const quotes = await yahooFinance.quote(symbols);
    const formatted = quotes.map(q => ({
      symbol: q.symbol,
      name: q.shortName,
      price: q.regularMarketPrice,
      change: q.regularMarketChange,
      changePercent: q.regularMarketChangePercent,
      dayLow: q.regularMarketDayRange?.low,
      dayHigh: q.regularMarketDayRange?.high,
      week52Low: q.fiftyTwoWeekRange?.low,
      week52High: q.fiftyTwoWeekRange?.high,
      marketCap: q.marketCap,
      volume: q.regularMarketVolume,
      peRatio: q.trailingPE,
      dividendYield: q.dividendYield,
    }));

    //set cached
    await client.set('stocks',JSON.stringify(formatted),{EX:3600});
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Configure routes with proper order (most specific first)
// Payment webhook (must be before regular payment routes)
app.use('/api/payment/webhook', express.raw({ type: "application/json" }), paymentRouter);

// Payment API routes
app.use('/api/payment', paymentRouter);

// Auth webhook
app.use('/webhook', express.raw({ type: "application/json" }), authRouter);

// General API routes
app.use('/api/order', OrderRouter);
//
app.use('/api/user', userRouter);



app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
