import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { GeneralContext } from "@/pages/Dashboard/components/GeneralContext";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import "./BuyActionWindow.css";

const BuyActionWindow = ({ data }) => {
  const { handleCloseBuyWindow } = useContext(GeneralContext);
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(data?.price || 0.0);
  const currency = "USD";
  const [orderType, setOrderType] = useState("DELIVERY");
  const [orderMode, setOrderMode] = useState("MARKET");
  const {findTransactionData ,findUserFundsData} = useContext(GeneralContext);

  const BASE_URL = import.meta.env.VITE_BASE_URL


  const orderTypes = [
    { value: "INTRADAY", label: "Intraday" },
    { value: "DELIVERY", label: "Delivery" },
    { value: "FNO", label: "F&O" },
  ];

  // Market hours check (9:15 AM to 3:30 PM IST, Monday to Friday)
  // const isMarketOpen = () => {
  //   const now = new Date();
  //   const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));

  //   const day = istTime.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  //   const hours = istTime.getHours();
  //   const minutes = istTime.getMinutes();
  //   const currentTime = hours * 60 + minutes;

  //   // Market is closed on weekends
  //   if (day === 0 || day === 6) {
  //     return false;
  //   }

  //   // Market hours: 9:15 AM (555 minutes) to 3:30 PM (930 minutes)
  //   const marketOpenTime = 9 * 60 + 15; // 9:15 AM
  //   const marketCloseTime = 15 * 60 + 30; // 3:30 PM

  //   return currentTime >= marketOpenTime && currentTime <= marketCloseTime;
  // };

  const [marketError, setMarketError] = useState("");

  const { getToken } = useAuth();

  const orderData = {
    symbol: data.symbol,
    mode: "BUY",
    name: data.name,
    quantity: stockQuantity,
    purchasePrice: stockPrice,
    actualPrice: data.price,
    changePercent: data.changePercent,
    orderType: orderType,
    currency,
  };

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if order type is allowed based on market hours
  // const isOrderTypeAllowed = () => {
  //   if (orderType === "INTRADAY" || orderType === "DELIVERY" || orderType === "FNO") {
  //     return isMarketOpen();
  //   }
  //   return true;
  // };

  // Get market status message
  // const getMarketStatusMessage = () => {
  //   if ((orderType === "INTRADAY" || orderType === "DELIVERY" || orderType === "FNO") && !isMarketOpen()) {
  //     const now = new Date();
  //     const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
  //     const day = istTime.getDay();

  //     const orderTypeLabel = orderType === "INTRADAY" ? "Intraday" : orderType === "DELIVERY" ? "Delivery" : "F&O";

  //     if (day === 0 || day === 6) {
  //       return `${orderTypeLabel} orders are not available on weekends. Market is closed.`;
  //     } else {
  //       return `${orderTypeLabel} orders are only available during market hours (9:15 AM - 3:30 PM IST).`;
  //     }
  //   }
  //   return "";
  // };

  // Get valuable market info message
  // const getMarketInfoMessage = () => {
  //   if (
  //     orderType === "INTRADAY" ||
  //     orderType === "DELIVERY" ||
  //     orderType === "FNO"
  //   ) {
  //     const now = new Date();
  //     const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
  //     const day = istTime.getDay();
  //     const hours = istTime.getHours();
  //     const minutes = istTime.getMinutes();
  //     const currentTime = hours * 60 + minutes;
  //     const orderTypeLabel = orderType === "INTRADAY" ? "Intraday" : orderType === "DELIVERY" ? "Delivery" : "F&O";
  //     if (isMarketOpen()) {
  //       const closeTime = 15 * 60 + 30; // 3:30 PM
  //       const remainingMinutes = closeTime - currentTime;
  //       const remainingHours = Math.floor(remainingMinutes / 60);
  //       const remainingMins = remainingMinutes % 60;
  //       return `🟢 Market is OPEN - ${orderTypeLabel} orders available (${remainingHours}h ${remainingMins}m until closing at 3:30 PM)`;
  //     } else if (day === 0 || day === 6) {
  //       // Weekend - show next Monday opening
  //       const daysUntilMonday = day === 0 ? 1 : 2; // Sunday=0, Saturday=6
  //       return `🔴 Market CLOSED (Weekend) - ${orderTypeLabel} orders unavailable until Monday 9:15 AM (${daysUntilMonday} day${daysUntilMonday > 1 ? 's' : ''} away)`;
  //     } else {
  //       // Weekday but outside market hours
  //       if (currentTime < 9 * 60 + 15) {
  //         // Before market opens
  //         const openTime = 9 * 60 + 15;
  //         const minutesUntilOpen = openTime - currentTime;
  //         const hoursUntilOpen = Math.floor(minutesUntilOpen / 60);
  //         const minsUntilOpen = minutesUntilOpen % 60;
  //         return `🔴 Market CLOSED - ${orderTypeLabel} orders unavailable until ${hoursUntilOpen}h ${minsUntilOpen}m (opens 9:15 AM)`;
  //       } else {
  //         // After market closes
  //         return `🔴 Market CLOSED - ${orderTypeLabel} orders unavailable until tomorrow 9:15 AM`;
  //       }
  //     }
  //   }
  //   return "";
  // };

  const createOrder = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setMarketError("");

      // // Check market hours restriction for all order types
      // if (!isOrderTypeAllowed()) {
      //   setMarketError(getMarketStatusMessage());
      //   setIsLoading(false);
      //   return;
      // }

      const authToken = await getToken();
      if (!authToken) {
        throw new Error("Authentication token not available");
      }

      // Calculate total amount in the given currency (server converts to INR when needed)
      const totalAmount = Number(stockQuantity) * Number(stockPrice);

      const orderPayload = {
        ...orderData,
        orderMode,    // "Market" or LIMIT
        totalAmount,
        status: "PENDING",
        placedAt: new Date().toISOString(),
      };
      await axios.post(
        `${BASE_URL}/api/order/create`,
        orderPayload,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // console.log("Order created successfully:", response.data);
      // You might want to trigger a refresh of the orders list here
      handleCloseBuyWindow();
      await findUserFundsData();
      await findTransactionData();
      // You can dispatch an event or call a callback to refresh the orders list
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to create order"
      );
      console.error("Error creating order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyClick = () => {
    createOrder();
  };

  const handleCancelClick = () => {
    handleCloseBuyWindow();
  };

  if (!data) return null;

  return (
    <div className="trade-popup-overlay" onClick={handleCancelClick}>
      <div className="trade-popup" onClick={(e) => e.stopPropagation()}>
        <div className="trade-popup-header">
          <h3>{data.name}</h3>
        </div>

        <div className="trade-popup-stock-info">
          <p className={data.changePercent < 0 ? "down" : "up"}>
            {data.changePercent < 0 ? (
              <span className="icon">↓</span>
            ) : (
              <span className="icon">↑</span>
            )}
            {Math.abs(data.changePercent)}%
          </p>
          <span className="stock-price">
            {currency === "USD" ? "$" : "₹"}
            {data.price}
          </span>
        </div>

        <div className="order-type-selector">
          {orderTypes.map((type) => (
            <label
              key={type.value}
              className={`order-type-option ${
                orderType === type.value ? "selected" : ""
              }`}
            >
              <input
                type="radio"
                name="orderType"
                value={type.value}
                checked={orderType === type.value}
                onChange={(e) => setOrderType(e.target.value)}
              />
              {type.label}
            </label>
          ))}
        </div>

        {/* Currency is fixed to USD */}

        <div className="buy-action-inputs">
          <fieldset>
            <legend>Qty.</legend>
            <input
              type="number"
              name="qty"
              id="qty"
              onChange={(e) => setStockQuantity(e.target.value)}
              value={stockQuantity}
            />
          </fieldset>
          <fieldset>
            <legend>Price</legend>
            <input
              type="number"
              name="price"
              id="price"
              step="0.05"
              onChange={(e) => setStockPrice(e.target.value)}
              value={stockPrice}
              readOnly={orderMode === "MARKET"}
            />
          </fieldset>
        </div>

        <div className="order-type">
          <label>
            <input
              type="radio"
              name="orderMode"
              value="MARKET"
              checked={orderMode === "MARKET"}
              onChange={() => {
                setOrderMode("MARKET");
                setStockPrice(data.price);
              }}

            />
            Market
          </label>
          <label>
            <input
              type="radio"
              name="orderMode"
              value="LIMIT"
              checked={orderMode === "LIMIT"}
              onChange={() => setOrderMode("LIMIT")}
            />
            Limit
          </label>
        </div>

        <div className="trade-popup-actions">
          {error && <div className="error-message">{error}</div>}
          {marketError && (
            <div className="market-error-message">{marketError}</div>
          )}
          {/* {getMarketInfoMessage() && (
            <div className="market-info-message">{getMarketInfoMessage()}</div>
          )} */}
          <span className="margin-text">
            {currency === "USD" ? "Margin (USD): $" : "Margin (INR): ₹"}
            {(Number(stockQuantity) * Number(stockPrice) * 0.2).toFixed(2)}
          </span>

          <div className="action-buttons">
            <button
              className={`buy-btn ${isLoading ? "loading" : ""} `} // ${!isOrderTypeAllowed() ? "disabled" : ""}
              onClick={handleBuyClick}
              // disabled={isLoading || !stockQuantity || !stockPrice || !isOrderTypeAllowed()}
            >
              {isLoading ? "Placing Order..." : "Buy"}
            </button>
            <button
              className="cancel-btn"
              onClick={handleCancelClick}
              // disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyActionWindow;
