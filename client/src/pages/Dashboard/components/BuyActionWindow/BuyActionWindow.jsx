import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { GeneralContext } from "@/pages/Dashboard/components/GeneralContext";
import { useAuth } from "@clerk/clerk-react";

import axios from "axios";


import "./BuyActionWindow.css";

const BuyActionWindow = ({  data }) => {
  const {handleCloseBuyWindow}=useContext(GeneralContext)
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(0.0);
  const [orderType, setOrderType] = useState("DELIVERY");

  const orderTypes = [
    { value: "INTRADAY", label: "Intraday" },
    { value: "DELIVERY", label: "Delivery" },
    { value: "FNO", label: "F&O" }
  ];

  const {getToken} = useAuth();

  const orderData = {
  symbol: data.symbol,
  mode: "BUY",
  name: data.name,
  quantity: stockQuantity,
  purchasePrice: stockPrice,
  actualPrice: data.price,
  changePercent: data.changePercent,
  orderType: orderType,
  };

const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const createOrder = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const authToken = await getToken();
      if (!authToken) {
        throw new Error("Authentication token not available");
      }

      // Calculate total amount
      const totalAmount = stockQuantity * stockPrice;

      const orderPayload = {
        ...orderData,
        totalAmount,
        status: "PENDING",
        placedAt: new Date().toISOString()
      };

      const response = await axios.post(
        "http://localhost:8000/api/order/create",
        orderPayload,   
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          }
        }
      );

      console.log("Order created successfully:", response.data);
      // You might want to trigger a refresh of the orders list here
      handleCloseBuyWindow();
      // You can dispatch an event or call a callback to refresh the orders list
    } catch (error) {
      setError(error.response?.data?.message || error.message || "Failed to create order");
      console.error("Error creating order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyClick = () => {
    createOrder();
    handleCloseBuyWindow();
  };

  const handleCancelClick = () => {
    handleCloseBuyWindow();
  };

  return (
    <div className="buy-action-overlay" onClick={handleCancelClick}>
      <div className="buy-action-container" id="buy-window" draggable="true" onClick={(e) => e.stopPropagation()}>
      <div className="buy-action-regular-order">
        <div className="order-type-selector">
          {orderTypes.map((type) => (
            <label key={type.value} className={`order-type-option ${orderType === type.value ? 'selected' : ''}`}>
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
            />
          </fieldset>
        </div>
      </div>

      <div className="buy-action-buttons">
        {error && <div className="error-message">{error}</div>}
        <span>Margin required ₹{(stockQuantity * stockPrice * 0.2).toFixed(2)}</span>
        <div>
          <button 
            className={`buy-action-btn buy-action-btn-blue ${isLoading ? 'loading' : ''}`} 
            onClick={handleBuyClick}
            disabled={isLoading || !stockQuantity || !stockPrice}
          >
            {isLoading ? 'Placing Order...' : 'Buy'}
          </button>
          <button 
            className="buy-action-btn buy-action-btn-grey" 
            onClick={handleCancelClick}
            disabled={isLoading}
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