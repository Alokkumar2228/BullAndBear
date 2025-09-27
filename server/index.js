import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './db/db.js';
import router from './routes/Routes.js';
import yahooFinance from 'yahoo-finance2';
import authRouter from './routes/authRoutes.js';
import client from './utils/redisclient.js';

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
  "TSLA", "NFLX", "NVDA", "BABA", "ORCL",
  "INTC", "AMD", "IBM", "CSCO", "ADBE",
  "PYPL", "QCOM", "SAP", "SHOP", "UBER",
  "LYFT", "TWTR", "SQ", "ZM", "CRWD",
  "DOCU", "PLTR", "SNOW", "COIN", "ROKU",
  "BA", "DIS", "NKE", "MCD", "SBUX",
  "JPM", "GS", "MS", "BAC", "WFC",
  "T", "VZ", "V", "MA", "AXP",
  "WMT", "COST", "PEP", "KO", "PFE"
];


// ✅ Stocks route
app.get("/api/stocks", async (req, res) => {
  try {

    // Check cache
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

// ✅ API routes
app.use('/api', router);

// ✅ Webhook route (use raw parser ONLY here)
app.use('/webhook', express.raw({ type: "application/json" }), authRouter);


app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
