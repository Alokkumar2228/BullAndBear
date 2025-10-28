import axios from "axios";
import { date } from "zod";

const API_KEY = "lX94JNVaadFWz8MO8ySstPu02wNHYJFF";
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
    res.status(200).json(filtered);
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
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Historical Market Capitalization
export const getMarketCap = async (req, res) => {
  const { symbol } = req.params;
  try {
    const response = await axios.get(
      `${BASE_URL}/historical-market-capitalization?symbol=${symbol}&apikey=${API_KEY}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. Balance Sheet Statement
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
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 6. Cash Flow Statement
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

    res.json(filteredData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 7. Income Statement As Reported
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
    res.json(filteredData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
