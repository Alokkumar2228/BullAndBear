import React, { useState ,useContext} from "react";
import { Link } from "react-router-dom";
import { GeneralContext } from "@/pages/Dashboard/components/GeneralContext";
import { useAuth } from "@clerk/clerk-react";

import axios from "axios";


import "./BuyActionWindow.css";

const BuyActionWindow = ({  data }) => {
  const {handleCloseBuyWindow}=useContext(GeneralContext)
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(0.0);

  const {getToken} = useAuth();

  const orderData = {
  symbol: data.symbol,
  mode: "BUY",
  name: data.name,
  quantity: stockQuantity,
  purchasePrice: stockPrice,
  actualPrice: data.price,
  changePercent:data.changePercent,
  };

const createOrder = async () => {
  try {
    const authToken = await getToken();
    console.log("authToken",authToken)
    const response = await axios.post(
      "http://localhost:8000/api/order/create",
      orderData,   
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        }
      }
    );
    console.log("Order created successfully:", response.data);
  } catch (error) {
    console.error("Error creating order:", error.response?.data || error.message);
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
    <div className="buy-action-container" id="buy-window" draggable="true">
      <div className="buy-action-regular-order">
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
        <span>Margin required ₹140.65</span>
        <div>
          <Link className="buy-action-btn buy-action-btn-blue" onClick={handleBuyClick} >
            Buy
          </Link>
          <Link to="" className="buy-action-btn buy-action-btn-grey" onClick={handleCancelClick}>
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BuyActionWindow;
