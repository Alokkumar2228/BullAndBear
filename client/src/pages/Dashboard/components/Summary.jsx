import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import "./dashboard.css";


const BASE_URL = import.meta.env.VITE_BASE_URL
const Summary = () => {
  const user = localStorage.getItem("user_name");

  const [allHoldings, setAllHoldings] = useState([]);

  const { getToken } = useAuth();

  const findOrder = async () => {
    try {
      const authToken = await getToken();
      const response = await axios.post(
        `${BASE_URL}/api/order/find`,
        {},
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      // console.log("Order created successfully:", response.data);
      setAllHoldings(response.data);
    } catch (error) {
      console.error(
        "Error creating order:",
        error.response?.data || error.message
      );
    }
  };

  useEffect(() => {
    findOrder();
  }, []);

  const calInvestment = () => {
    let sum = 0;
    allHoldings.forEach((stock) => {
      sum += stock.totalAmount || 0;
    });
    return sum;
  };

  const calActualValue = () => {
    let currVal = 0;
    allHoldings.forEach(
      (stock) => (currVal += stock.quantity * stock.actualPrice)
    );
    return currVal.toFixed(2);
  };

  const profit = (calActualValue() - calInvestment()).toFixed(2);
  const profitPercentage = ((profit / calInvestment()) * 100).toFixed(2);

  return (
    <>
      <div className="username">
        <h6>Hi, {user}!</h6>
        <hr className="divider" />
      </div>

      <div className="section">
        <span>
          <p>Equity</p>
        </span>

        <div className="data">
          <div className="first">
            <h3>3.74k</h3>
            <p>Margin available</p>
          </div>
          <hr />

          <div className="second">
            <p>
              Margins used <span>0</span>{" "}
            </p>
            <p>
              Opening balance <span>3.74k</span>{" "}
            </p>
          </div>
        </div>
        <hr className="divider" />
      </div>

      <div className="section">
        <span>
          <p>Holdings ({allHoldings.length})</p>
        </span>

        <div className="data">
          <div className="first">
            <h3
              className="profit"
              style={{ color: Number(profit) > 0 ? "green" : "red" }}
            >
              ${Number(profit).toFixed(2)}{" "}
              <small style={{ color: Number(profit) > 0 ? "green" : "red" }}>
                ({Number(profitPercentage).toFixed(2)}%)
              </small>
            </h3>

            <p>P&L</p>
          </div>
          <hr />

          <div className="second">
            <p>
              Current Value <span>${calActualValue()}</span>{" "}
            </p>
            <p>
              Investment <span>${calInvestment()}</span>{" "}
            </p>
          </div>
        </div>
        <hr className="divider" />
      </div>
    </>
  );
};

export default Summary;
