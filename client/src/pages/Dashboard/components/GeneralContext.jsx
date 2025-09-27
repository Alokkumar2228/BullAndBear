import React, { useState } from "react";
import BuyActionWindow from "@/pages/Dashboard/components/BuyActionWindow/BuyActionWindow";


export const GeneralContext = React.createContext({});

export const GeneralContextProvider = (props) => {
  const [isBuyWindowOpen, setIsBuyWindowOpen] = useState(false);
  const [selectedStockUID, setSelectedStockUID] = useState("");
  const [selectedStockData, setSelectedStockData] = useState(null);

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

  return (
    <GeneralContext.Provider value={{ handleOpenBuyWindow, handleCloseBuyWindow }}>
      {props.children}
      {isBuyWindowOpen && <BuyActionWindow uid={selectedStockUID} data = {selectedStockData} />}
    </GeneralContext.Provider>
  );
};
