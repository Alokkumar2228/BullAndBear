import React, { useState, useEffect, useCallback } from "react";
import BuyActionWindow from "@/pages/Dashboard/components/BuyActionWindow/BuyActionWindow";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "react-toastify";

export const GeneralContext = React.createContext({});

export const GeneralContextProvider = (props) => {
  const { getToken } = useAuth();
  const [isBuyWindowOpen, setIsBuyWindowOpen] = useState(false);
  const [selectedStockUID, setSelectedStockUID] = useState("");
  const [selectedStockData, setSelectedStockData] = useState(null);
  const [transactionData, setTransactionData] = useState([]);
  const [userFundData, setUserFundData] = useState({});

  // General loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [marketError, setMarketError] = useState("");

  // Orders state Management
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);

  // Holdings state Management
  const [holdings, setHoldings] = useState([]);
  const [holdingsLoading, setHoldingsLoading] = useState(false);
  const [holdingsError, setHoldingsError] = useState(null);

  // Positions state Management
  const [positions, setPositions] = useState([]);
  const [positionLoading, setPositionLoading] = useState(false);
  const [positionsError, setPositionsError] = useState(null);

  const handleOpenBuyWindow = (uid, data) => {
    setIsBuyWindowOpen(true);
    setSelectedStockUID(uid);
    setSelectedStockData(data);
  };

  const handleCloseBuyWindow = () => {
    setIsBuyWindowOpen(false);
    setSelectedStockUID("");
    setSelectedStockData(null);
  };

  // Environment variable for base URL
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  
  // Fetch user holdings
  const getUserHoldings = useCallback(async () => {
    setHoldingsLoading(true);
    setHoldingsError(null);

    try {
      const token = await getToken();

      const res = await axios.get(
        `${BASE_URL}/api/order/get-user-order?type=DELIVERY`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setHoldings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setHoldings([]);
      setHoldingsError(
        err.response?.data?.message || err.message || "Failed to load holdings"
      );
    } finally {
      setHoldingsLoading(false);
    }
  }, [getToken, BASE_URL]);

  // Fetch user positions
  const getUserPositions = useCallback(async () => {
    setPositionLoading(true);
    setPositionsError(null);
    try {
      const authToken = await getToken();

      const response = await axios.get(
        `${BASE_URL}/api/order/get-user-order?type=FNO,INTRADAY`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error("Invalid response format from server");
      }
      setPositions(response.data);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch positions"
      );
      setPositions([]);
    } finally {
      setPositionLoading(false);
    }
  }, [getToken, BASE_URL]);

  // Fetch all user orders
  const getAllUserOrders = useCallback(async () => {
    try {
      setOrdersError(null);
      setOrdersLoading(true);

      const authToken = await getToken();
      if (!authToken) throw new Error("Auth token missing");

      const response = await axios.get(
        `${BASE_URL}/api/order/get-all-user-order`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      setOrders(response.data.orders || []);
      return { success: true, data: response.data.orders };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch user orders";

      setOrdersError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setOrdersLoading(false);
    }
  }, [getToken, BASE_URL]);

  // Create Order API
  const createOrderAPI = useCallback(
    async ({
      orderData,
      orderMode,
      stockQuantity,
      stockPrice,
      // isOrderTypeAllowed,
      // getMarketStatusMessage,
      onSuccess,
    }) => {
      setError(null);
      setMarketError("");

      try {
        setIsLoading(true);

        // Auth Token Check
        const authToken = await getToken();
        if (!authToken)
          return {
            success: false,
            message: "Authentication token not available",
          };

        // Input Validation
        if (
          !stockQuantity ||
          !stockPrice ||
          stockQuantity <= 0 ||
          stockPrice <= 0
        ) {
          return { success: false, message: "Invalid quantity or price" };
        }

        //  Pre-calc amount
        const totalAmount = Number(stockQuantity) * Number(stockPrice);

        //  Final payload
        const orderPayload = {
          ...orderData,
          orderMode,
          totalAmount,
          status: "PENDING",
          placedAt: new Date().toISOString(),
        };

        //  API Call
        const response = await axios.post(
          `${BASE_URL}/api/order/create`,
          orderPayload,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        // Handle success state
        if (response.data.success) {
          onSuccess && onSuccess();
          return { success: true, data: response.data };
        }

        return { success: false };
      } catch (error) {
        console.error("Create Order Error:", error);

        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to create order";

        setError(message);

        return { success: false, message };
      } finally {
        setIsLoading(false);
      }
    },
    [getToken, BASE_URL] // dependencies for stable function
  );

  // Fetch user fund data for the authenticated user
  const findUserFundsData = useCallback(async () => {
    const authToken = await getToken();
    const response = await axios.get(`${BASE_URL}/api/user/get-user-data`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });
    const data = {
      balance: response.data.user.balance,
      investedAmount: response.data.user.investedAmount,
      withdrawAmount: response.data.user.withdrawAmount,
    };
    setUserFundData(data);
  }, [getToken, BASE_URL]);

  // Fetch transaction data for the authenticated user
  const findTransactionData = useCallback(async () => {
    try {
      const authToken = await getToken();
      const response = await axios.get(
        `${BASE_URL}/api/payment/get-transaction-data`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      setTransactionData(response.data.transactions);
    } catch (error) {
      console.error("Error fetching transaction data:", error);
    }
  }, [getToken, BASE_URL]);

  // Save daily P&L for the authenticated user
  const saveDailyPL = useCallback(
    async (totalPL, dateStr) => {
      try {
        const authToken = await getToken();
        const payload = { totalPL: totalPL };
        if (dateStr) payload.date = dateStr;
        console.log("saveDailyPL payload", payload);

        // Choose endpoint per-category (server exposes separate routes)
        let endpoint = `${BASE_URL}/api/financial/daily-pl/holdings`;

        const response = await axios.post(endpoint, payload, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });
        return response.data;
      } catch (error) {
        console.error("saveDailyPL error", error);
        return { success: false, error };
      }
    },
    [getToken, BASE_URL]
  );

  // Withdraw fund
  const withdrawFund = useCallback(
    async (data) => {
      try {
        const authToken = await getToken();
        const response = await axios.post(
          `${BASE_URL}/api/payment/withdraw-order`,
          data,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        return response.data;
      } catch (error) {
        console.error("Error withdrawing fund:", error);
        return { success: false, message: "Withdraw request failed." };
      }
    },
    [getToken, BASE_URL]
  );

  // Handle selling stock
  const handleSellStock = useCallback(
    async (data, quantity) => {
      const authToken = await getToken();
      const selldata = {
        symbol: data.symbol,
        quantity: quantity,
        sellPrice: data.actualPrice,
        orderId: data.orderId,
      };

      const response = await axios.post(
        `${BASE_URL}/api/order/sell-order`,
        { selldata },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        await findUserFundsData();
        await findTransactionData();
        toast.success("Order sold successfully!");
      }

      return response.data;
    },
    [getToken, findUserFundsData, findTransactionData, BASE_URL]
  );

  const initializeDashboardData = useCallback(async () => {
    await Promise.all([findUserFundsData(), findTransactionData()]);
  }, [findUserFundsData, findTransactionData]);

  useEffect(() => {
    initializeDashboardData();
  }, [initializeDashboardData]);

  return (
    <GeneralContext.Provider
      value={{
        handleOpenBuyWindow,
        transactionData,
        handleCloseBuyWindow,
        userFundData,
        findTransactionData,
        findUserFundsData,
        withdrawFund,
        handleSellStock,
        saveDailyPL,
        isLoading,
        error,
        setError,
        marketError,
        setMarketError,
        createOrderAPI,
        orders,
        ordersLoading,
        ordersError,
        getAllUserOrders,
        holdings,
        holdingsLoading,
        holdingsError,
        getUserHoldings,
        positions,
        positionLoading,
        positionsError,
        getUserPositions,
      }}
    >
      {props.children}
      {isBuyWindowOpen && (
        <BuyActionWindow uid={selectedStockUID} data={selectedStockData} />
      )}
    </GeneralContext.Provider>
  );
};
