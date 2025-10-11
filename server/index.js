import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./db/db.js";
import OrderRouter from "./routes/OrderRoutes.js";
import yahooFinance from "yahoo-finance2";
import authRouter from "./routes/authRoutes.js";
import client from "./utils/redisclient.js";
import paymentRouter from "./routes/paymentRoutes.js";
import userRouter from "./routes/userRoutes.js";
import financialRouter from "./routes/financialRoute.js";

const app = express();
const PORT = process.env.PORT || 8000;

// Normal middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Connect DB
connectDB();

// Stock symbols
const symbols = [   "AAPL",   "MSFT",   "GOOGL",   "AMZN",   "META",   "TSLA",   "NVDA", 
    "NFLX",   "ADBE", "ORCL",   "INTC",   "AMD",   "IBM",   "CSCO",   "QCOM",   "SAP",  
    "CRM",   "NOW",   "SNOW",   "PLTR",   "V",   "MA",   "PYPL",   "SQ",   "AXP",   "COIN",  
    "INTU",   "FIS",   "FISV",   "GPN",   "SHOP",   "MELI",   "WMT",   "COST",   "TGT",   "BABA", 
      "JD",   "PDD",   "EBAY",   "ETSY",   "UBER",   "LYFT",   "DAL",   "UAL",   "AAL",   "BA",  
      "RCL",   "CCL",   "MAR",   "ABNB",   "NKE",   "MCD",   "SBUX",   "KO",   "PEP",   "PG",   "UL", 
      "CL",   "KMB",   "GIS",   "XOM",   "CVX",   "BP",   "SHEL",   "COP",   "DUK",   "NEE",   "SO", 
      "ENPH",   "FSLR",   "JPM",   "GS",   "MS",   "BAC",   "WFC",   "C",   "BLK",   "SCHW",   "TROW", 
     "SPGI",   "PFE",  "JNJ",   "MRK",   "ABBV",   "LLY",   "UNH",   "BMY",   "AMGN",   "GILD",   "CVS",   "DIS",   "PARA",   "ROKU",   "WBD",   "SONY",   "TTWO",   "EA",   "MTCH",   "SPOT",   "ZM", ];
// ✅ Stocks route
app.get("/api/stocks", async (req, res) => {
  try {
    const cachedData = await client.get("stocks");
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    const quotes = await yahooFinance.quote(symbols);
    const formatted = quotes.map((q) => ({
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
    await client.set("stocks", JSON.stringify(formatted), { EX: 3600 });
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/hist/stocks", async (req, res) => {
  try {
    const stocksymbol = req.query.symbol || "MSFT"; // default to AAPL
    // const now = Math.floor(Date.now() / 1000);
    // const fiveYearsAgo = now - 5 * 365 * 24 * 60 * 60;

    const queryOptions = { period1: '2019-01-01', period2: '2020-01-01', interval: "1d" };

    const result = await yahooFinance.chart(stocksymbol, queryOptions);
    // console.log(result);
    if (result) {
      return res.status(200).json({ result : result });
    }

    // const data = result.chart.result[0];
    // const prices = data.timestamp.map((t, i) => ({
    //   date: new Date(t * 1000),
    //   open: data.indicators.quote[0].open[i],
    //   high: data.indicators.quote[0].high[i],
    //   low: data.indicators.quote[0].low[i],
    //   close: data.indicators.quote[0].close[i],
    //   volume: data.indicators.quote[0].volume[i],
    // }));

    // res.status(200).json(prices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});



// Configure routes with proper order (most specific first)
// Payment webhook (must be before regular payment routes)
app.use(
  "/api/payment/webhook",
  express.raw({ type: "application/json" }),
  paymentRouter
);

// Payment API routes
app.use("/api/payment", paymentRouter);

// Auth webhook
app.use("/webhook", express.raw({ type: "application/json" }), authRouter);

// General API routes
app.use("/api/order", OrderRouter);
//
app.use("/api/user", userRouter);

app.use("/api/financial", financialRouter);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
