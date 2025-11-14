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

const allowedOrigins = [
  "http://localhost:5173",
  "https://bull-and-bear.vercel.app",
  "https://bull-and-bear-232a-git-main-alok-kumar-singhs-projects.vercel.app",
  "https://bullandbear-2.onrender.com"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow mobile apps / server-side

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false); // ❗ Don't throw errors
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

// Normal middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.get("/", (req, res) => {
  res.send("API is running...");
});

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

app.get("/api/us-market-indices", async (req, res) => {
  try {
    const cacheKey = "us-market-indices";

    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }


    const [sp500, dowJones, nasdaq] = await Promise.all([
      yahooFinance.quote("^GSPC"),  // S&P 500
      yahooFinance.quote("^DJI"),   // Dow Jones Industrial Average
      yahooFinance.quote("^IXIC"),  // NASDAQ Composite
    ]);

    const indicesData = {
      sp500: {
        symbol: sp500.symbol,
        name: sp500.shortName,
        price: sp500.regularMarketPrice,
        change: sp500.regularMarketChange,
        changePercent: sp500.regularMarketChangePercent,
      },
      dowJones: {
        symbol: dowJones.symbol,
        name: dowJones.shortName,
        price: dowJones.regularMarketPrice,
        change: dowJones.regularMarketChange,
        changePercent: dowJones.regularMarketChangePercent,
      },
      nasdaq: {
        symbol: nasdaq.symbol,
        name: nasdaq.shortName,
        price: nasdaq.regularMarketPrice,
        change: nasdaq.regularMarketChange,
        changePercent: nasdaq.regularMarketChangePercent,
      },
    };


    await client.set(cacheKey, JSON.stringify(indicesData), { EX: 3600 });

    res.json(indicesData);
  } catch (error) {
    console.error("Error fetching US market indices:", error);
    res.status(500).json({ error: "Failed to fetch US market data" });
  }
});

app.get("/api/hist/stocks", async (req, res) => {
  try {
    const stocksymbol = req.query.symbol || "MSFT"; 

    const queryOptions = { period1: '2019-01-01', period2: '2020-01-01', interval: "1d" };

    const result = await yahooFinance.chart(stocksymbol, queryOptions);
    // console.log(result);
    if (result) {
      return res.status(200).json({ result : result });
    }

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