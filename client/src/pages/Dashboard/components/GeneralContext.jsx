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
  }, []);

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
}, []);

useEffect(() => {
  findUserFundsData();
  findTransactionData();
}, [findUserFundsData, findTransactionData]);


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
}, []);

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

  },[getToken ,findUserFundsData, findTransactionData]);

  return (
    <GeneralContext.Provider value={{ handleOpenBuyWindow,transactionData, handleCloseBuyWindow ,
    userFundData ,findTransactionData ,findUserFundsData,withdrawFund , handleSellStock}}>
      {props.children}
      {isBuyWindowOpen && <BuyActionWindow uid={selectedStockUID} data = {selectedStockData} />}
    </GeneralContext.Provider>
  );
};
