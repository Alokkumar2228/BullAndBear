import express from 'express';
import {
    getKeyMetrics,
    getFinancialScores,
    getMarketCap,
    getBalanceSheet,
    getCashFlow,
    getIncomeStatementReported,
} from '../controllers/financialController.js';
// import clerkAuth from '../middleware/clerkAuth.js';

const router = express.Router();
// app.use(clerkAuth); 


// Routes with unique names
router.get('/metrics/:symbol', getKeyMetrics);                // Key Metrics
router.get('/scores/:symbol', getFinancialScores);           // Financial Scores
router.get('/market-cap/:symbol', getMarketCap);             // Market Capitalization
router.get('/balance-sheet/:symbol', getBalanceSheet);       // Balance Sheet Statement
router.get('/cash-flow/:symbol', getCashFlow);               // Cash Flow Statement
router.get('/income-reported/:symbol', getIncomeStatementReported); // Income Statement As Reported

export default router;

// Access essential financial metrics for a company with the FMP Financial Key Metrics API. Evaluate revenue, net income, P/E ratio, and more to assess performance and compare it to competitors.
// https://financialmodelingprep.com/stable/key-metrics?symbol=AAPL&apikey=lX94JNVaadFWz8MO8ySstPu02wNHYJFF

//Finiancial Score
//https://financialmodelingprep.com/stable/financial-scores?symbol=AAPL&apikey=lX94JNVaadFWz8MO8ySstPu02wNHYJFF

//Track key financial growth metrics with the Income Statement Growth API. Analyze how revenue, profits, and expenses have evolved over time,
//  offering insights into a company’s financial health and operational efficiency.
//https://financialmodelingprep.com/stable/income-statement-growth?symbol=AAPL&apikey=lX94JNVaadFWz8MO8ySstPu02wNHYJFF

//Market Capture
//https://financialmodelingprep.com/stable/historical-market-capitalization?symbol=AAPL&apikey=lX94JNVaadFWz8MO8ySstPu02wNHYJFF

//Balance Sheet statement
//https://financialmodelingprep.com/stable/balance-sheet-statement?symbol=AAPL&apikey=lX94JNVaadFWz8MO8ySstPu02wNHYJFF

//Cash Flow statement
//https://financialmodelingprep.com/stable/cash-flow-statement?symbol=AAPL&apikey=lX94JNVaadFWz8MO8ySstPu02wNHYJFF

//Income Statement
//https://financialmodelingprep.com/stable/income-statement-as-reported?symbol=AAPL&apikey=lX94JNVaadFWz8MO8ySstPu02wNHYJFF

//Reported Balance Statement
//https://financialmodelingprep.com/stable/balance-sheet-statement-as-reported?symbol=AAPL&apikey=lX94JNVaadFWz8MO8ySstPu02wNHYJFF