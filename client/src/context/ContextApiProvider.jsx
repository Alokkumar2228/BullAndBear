import { ContextApi } from "./ContextApi";
import axios from "axios";
import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/clerk-react";

export const ContextApiProvider = ({ children }) => {
  const { user } = useUser();
  const [USMarketIndicesData, setUSMarketIndicesData] = useState({});

  const user_name = user?.primaryEmailAddress?.emailAddress.split("@")[0];
  localStorage.setItem("user_name", user_name);

  useEffect(() => {
    if (user) {
      const user_name = user?.primaryEmailAddress?.emailAddress.split("@")[0];
      localStorage.setItem("user_name", user_name);
      localStorage.setItem("user_name", user_name);
    }
  }, [user]);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [watchlist, setWatchList] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  const fetchWatchList = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/stocks`);

      const modifyData = response.data.map((stock) => {
        const isDown = stock.changePercent <= 0;
        return { ...stock, isDown };
      });

      setWatchList(modifyData);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
    }
  }, [BASE_URL, setWatchList]);

  const getUSMarketIndicesData = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/us-market-indices`);
      if (response.data) {
        setUSMarketIndicesData(response.data);
      }
    } catch (error) {
      console.error("Error fetching Nifty and Sensex data:", error);
    }
  }, [BASE_URL]);

  const callAllApi = useCallback(async () => {
    await Promise.all([fetchWatchList(), getUSMarketIndicesData()]);
  }, [getUSMarketIndicesData, fetchWatchList]);

  useEffect(() => {
    callAllApi();
  }, []);

//   console.log("NiftySensexData from context", NiftySensexData);

  return (
    <ContextApi.Provider
      value={{
        watchlist,
        isLoading,
        setIsLoading,
        getUSMarketIndicesData,
        USMarketIndicesData,
      }}
    >
      {children}
    </ContextApi.Provider>
  );
};
