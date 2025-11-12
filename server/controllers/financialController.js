import axios from "axios";
import yahooFinance from "yahoo-finance2";
import DailyPLHoldings from "../models/DailyPLHoldingsModel.js";

const API_KEY = "FxQSoUy8VIDJ6FtgkyzHvAHAUzOsGHx0";
const BASE_URL = "https://financialmodelingprep.com/stable";

// 1. Key Metrics
export const getKeyMetrics = async (req, res) => {
  const { symbol } = req.params;
  try {
    const response = await axios.get(
      `${BASE_URL}/key-metrics?symbol=${symbol}&apikey=${API_KEY}`
    );
    const filtered = response.data.map((item) => {
      return {
        symbol: item.symbol,
        date: item.date,
        fiscalYear: item.fiscalYear,
        currency: item.reportedCurrency || "USD",
        // Balance Sheet Proxies
        inventory: item.averageInventory || null,
        totalAssets: item.tangibleAssetValue || null,
        shareholdersEquity: item.investedCapital || null,
      };
    });
    res.status(200).json({success:true, data: filtered });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Financial Scores
export const getFinancialScores = async (req, res) => {
  const { symbol } = req.params;
  try {
    const response = await axios.get(
      `${BASE_URL}/financial-scores?symbol=${symbol}&apikey=${API_KEY}`
    );
    res.json({success:true, data: response.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Historical Market Capitalization
export const getMarketCap = async (req, res) => {
  const { symbol } = req.params;
  try {
    const response = await axios.get(
      `${BASE_URL}/historical-market-capitalization?symbol=${symbol}&apikey=${API_KEY}`
    );
    res.json({success:true, data: response.data });
  } catch (error) {
    res.status(500).json({success:false , error: error.message });
  }
};

// 4. Balance Sheet Statement
export const getBalanceSheet = async (req, res) => {
  const { symbol } = req.params;
  try {
    const response = await axios.get(
      `${BASE_URL}/balance-sheet-statement?symbol=${symbol}&apikey=${API_KEY}`
    );
    const data = response.data.map((item) => {
      return {
        symbol: item.symbol,
        fiscalYear: item.fiscalYear,
        totalAssets: item.totalAssets,
        totalLiabilities: item.totalLiabilities,
        totalEquity: item.totalEquity,
        cashAndShortTermInvestments: item.cashAndShortTermInvestments,
        longTermDebt: item.longTermDebt,
        totalDebt: item.totalDebt,
        netDebt: item.netDebt,
      };
    });
    res.json({success:true , data:data});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. Cash Flow Statement
export const getCashFlow = async (req, res) => {
  const { symbol } = req.params;
  try {
    const response = await axios.get(
      `${BASE_URL}/cash-flow-statement?symbol=${symbol}&apikey=${API_KEY}`
    );

    // Assuming response.data is an array
    const filteredData = response.data.map((item) => ({
      fiscalYear: item.fiscalYear,
      netIncome: item.netIncome,
      operatingCashFlow: item.operatingCashFlow,
      capitalExpenditure: item.capitalExpenditure,
      freeCashFlow: item.freeCashFlow,
      dividendsPaid: item.netDividendsPaid,
      stockBuybacks: item.commonStockRepurchased,
      netDebtChange: item.netDebtIssuance,
    }));

    res.json({success:true, data: filteredData});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 6. Income Statement As Reported
export const getIncomeStatementReported = async (req, res) => {
  const { symbol } = req.params;
  try {
    const response = await axios.get(
      `${BASE_URL}/income-statement-as-reported?symbol=${symbol}&apikey=${API_KEY}`
    );
    const filteredData = response.data.map((item) => ({
      fiscalYear: item.fiscalYear,
      netProfit: item.data.grossprofit,
    }));
    res.json({success:true, data: filteredData});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Save holdings daily P&L (upsert)
export const saveDailyPLHoldings = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.user_id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { date: dateStr, totalPL } = req.body;
    const plNum = typeof totalPL === 'number' ? totalPL : Number(totalPL);
    if (!Number.isFinite(plNum)) return res.status(400).json({ error: 'totalPL must be a number' });

    const date = dateStr ? new Date(dateStr).toISOString().split('T')[0] :  new Date().toISOString().split('T')[0];

    const doc = await DailyPLHoldings.findOneAndUpdate(
      { user_id: userId, date: date },
      {$set: { totalPL: plNum } },
      { upsert: true, new: true} ////options: create if not found , return updated doc
    );

    res.status(200).json({ success: true, data: doc });
  } catch (err) {
    console.error('saveDailyPLHoldings error', err);
    res.status(500).json({ error: err.message });
  }
};

// Get holdings history
export const getDailyPLHoldingsHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const rows = await DailyPLHoldings.find({ user_id: userId }).sort({ date: 1 }).lean();
    res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error('getDailyPLHoldingsHistory error', err);
    res.status(500).json({ error: err.message });
  }
};


