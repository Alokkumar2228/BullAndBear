import axios from 'axios';

const API_KEY = 'lX94JNVaadFWz8MO8ySstPu02wNHYJFF';
const BASE_URL = 'https://financialmodelingprep.com/stable';

// 1. Key Metrics
export const getKeyMetrics = async (req, res) => {
    const { symbol } = req.params;
    try {
        const response = await axios.get(`${BASE_URL}/key-metrics?symbol=${symbol}&apikey=${API_KEY}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. Financial Scores
export const getFinancialScores = async (req, res) => {
    const { symbol } = req.params;
    try {
        const response = await axios.get(`${BASE_URL}/financial-scores?symbol=${symbol}&apikey=${API_KEY}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. Income Statement Growth
export const getIncomeStatementGrowth = async (req, res) => {
    const { symbol } = req.params;
    try {
        const response = await axios.get(`${BASE_URL}/income-statement-growth?symbol=${symbol}&apikey=${API_KEY}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. Historical Market Capitalization
export const getMarketCap = async (req, res) => {
    const { symbol } = req.params;
    try {
        const response = await axios.get(`${BASE_URL}/historical-market-capitalization?symbol=${symbol}&apikey=${API_KEY}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 5. Balance Sheet Statement
export const getBalanceSheet = async (req, res) => {
    const { symbol } = req.params;
    try {
        const response = await axios.get(`${BASE_URL}/balance-sheet-statement?symbol=${symbol}&apikey=${API_KEY}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 6. Cash Flow Statement
export const getCashFlow = async (req, res) => {
    const { symbol } = req.params;
    try {
        const response = await axios.get(`${BASE_URL}/cash-flow-statement?symbol=${symbol}&apikey=${API_KEY}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 7. Income Statement As Reported
export const getIncomeStatementReported = async (req, res) => {
    const { symbol } = req.params;
    try {
        const response = await axios.get(`${BASE_URL}/income-statement-as-reported?symbol=${symbol}&apikey=${API_KEY}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 8. Reported Balance Sheet
export const getBalanceSheetReported = async (req, res) => {
    const { symbol } = req.params;
    try {
        const response = await axios.get(`${BASE_URL}/balance-sheet-statement-as-reported?symbol=${symbol}&apikey=${API_KEY}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
