import React, { useState, useEffect, useCallback } from "react";
import BuyActionWindow from "@/pages/Dashboard/components/BuyActionWindow/BuyActionWindow";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";



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

  

  const findUserFundsData = useCallback(async() =>{
    const authToken = await getToken();
    console.log(authToken);
    const response = await axios.get("http://localhost:8000/api/user/get-user-data",{
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

  const findTransactionData = useCallback(async()=>{
    const authToken = await getToken();
    const response = await axios.get("http://localhost:8000/api/payment/get-transaction-data",{
      headers:{
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      }
    } )
    setTransactionData(response.data.transactions);
    // console.log("transaction" ,response.data);
  }, []); 

  useEffect(()=>{
      findUserFundsData();
      findTransactionData();
  },[ findUserFundsData, findTransactionData])

  useEffect(()=>{
    console.log("transactionData" ,transactionData);
  },[transactionData])

  return (
    <GeneralContext.Provider value={{ handleOpenBuyWindow,transactionData, handleCloseBuyWindow ,
    userFundData ,findTransactionData ,findUserFundsData}}>
      {props.children}
      {isBuyWindowOpen && <BuyActionWindow uid={selectedStockUID} data = {selectedStockData} />}
    </GeneralContext.Provider>
  );
};
