import React, { useState, useEffect, useCallback } from "react";
import BuyActionWindow from "@/pages/Dashboard/components/BuyActionWindow/BuyActionWindow";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { toast } from 'react-toastify';


export const GeneralContext = React.createContext({});

export const GeneralContextProvider = (props) => {
  const { getToken } = useAuth();
  const [isBuyWindowOpen, setIsBuyWindowOpen] = useState(false);
  const [selectedStockUID, setSelectedStockUID] = useState("");
  const [selectedStockData, setSelectedStockData] = useState(null);
  const [transactionData , setTransactionData] = useState([]);
  const [userFundData,setUserFundData] = useState({});

  const handleOpenBuyWindow = (uid , data) => {
    setIsBuyWindowOpen(true);
    setSelectedStockUID(uid);
    setSelectedStockData(data);
  };

  const handleCloseBuyWindow = () => {
    setIsBuyWindowOpen(false);
    setSelectedStockUID("");
    setSelectedStockData(null);
  };
  const BASE_URL = import.meta.env.VITE_BASE_URL



  const findUserFundsData = useCallback(async() =>{
    const authToken = await getToken();
    const response = await axios.get(`${BASE_URL}/api/user/get-user-data`,{
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      }
    });
    const data = {
      balance : response.data.user.balance,
      investedAmount : response.data.user.investedAmount,
      withdrawAmount : response.data.user.withdrawAmount,
    }
    setUserFundData(data);
  }, [getToken, BASE_URL]);

const findTransactionData = useCallback(async () => {
  try {
    const authToken = await getToken();
    const response = await axios.get(`${BASE_URL}/api/payment/get-transaction-data`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });
    setTransactionData(response.data.transactions);
    
  } catch (error) {
    console.error("Error fetching transaction data:", error);
  }
}, [getToken, BASE_URL]);

  // Save daily P&L for the authenticated user
  const saveDailyPL = useCallback(
    async (totalPL, dateStr, category) => {
      try {
        const authToken = await getToken();
        // dateStr expected as 'YYYY-MM-DD' (optional)
        const payload = { totalPL };
        if (dateStr) payload.date = dateStr;
        if (category) payload.category = category;

        // Simple local de-duplication: if we've already saved the exact same value for today, skip
        try {
          const today = dateStr || new Date().toISOString().slice(0, 10);
          const key = `dailyPL_last_${category || 'combined'}`;
          const last = JSON.parse(localStorage.getItem(key) || '{}' );
          if (last?.date === today && Number(last?.totalPL) === Number(totalPL)) {
            return { skipped: true };
          }
        } catch (err) {
          // ignore localStorage parse errors
        }

        // Choose endpoint per-category (server exposes separate routes)
        let endpoint = `${BASE_URL}/api/financial/daily-pl`;
        if (category === 'holdings') endpoint = `${BASE_URL}/api/financial/daily-pl/holdings`;
        else if (category === 'positions') endpoint = `${BASE_URL}/api/financial/daily-pl/positions`;

        const response = await axios.post(endpoint, payload, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });

        // update local cache per-category
        try {
          const savedDate = payload.date || new Date().toISOString().slice(0, 10);
          const key = `dailyPL_last_${payload.category || 'combined'}`;
          localStorage.setItem(key, JSON.stringify({ date: savedDate, totalPL }));
        } catch (err) {
          /* ignore */
        }

        return response.data;
      } catch (error) {
        console.error('saveDailyPL error', error);
        return { success: false, error };
      }
    },
    [getToken, BASE_URL]
  );

// useEffect(() => {
//   findUserFundsData();
//   findTransactionData();
// }, [findUserFundsData, findTransactionData]);


const withdrawFund = useCallback(async (data) => {
  try {
    const authToken = await getToken();
    const response = await axios.post(`${BASE_URL}/api/payment/withdraw-order`, data, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error withdrawing fund:", error);
    return { success: false, message: "Withdraw request failed." };
  }
}, [getToken, BASE_URL]);

  const handleSellStock = useCallback(async(data , quantity)=>{
    
    const authToken = await getToken();
    const selldata = {
      symbol : data.symbol,
      quantity : quantity,
      sellPrice : data.actualPrice,
      orderId : data.orderId,
    }
   
    const response = await axios.post(`${BASE_URL}/api/order/sell-order`,{selldata},{
      headers:{
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      }
    });

    if(response.data.success){
      await findUserFundsData();
      await findTransactionData();
      toast.success("Order sold successfully!");
    }

    return response.data;

  },[getToken ,findUserFundsData, findTransactionData,BASE_URL]);


  const initializeDashboardData = useCallback(async()=>{
    await Promise.all([
      findUserFundsData(),
      findTransactionData(),
    ])
  },[findUserFundsData, findTransactionData])

    useEffect(() => {
    initializeDashboardData();
  }, [initializeDashboardData]);



  return (
    <GeneralContext.Provider value={{ handleOpenBuyWindow, transactionData, handleCloseBuyWindow,
      userFundData, findTransactionData, findUserFundsData, withdrawFund, handleSellStock, saveDailyPL }}>
      {props.children}
      {isBuyWindowOpen && <BuyActionWindow uid={selectedStockUID} data = {selectedStockData} />}
    </GeneralContext.Provider>
  );
};
