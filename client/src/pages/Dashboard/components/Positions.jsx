
import React, { useState, useEffect, useCallback } from "react"; 
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import './dashboard.css'


const Positions = () => {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();

  const fetchPositions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const authToken = await getToken();
      console.log("Fetching positions with token:", authToken);
      
      const response = await axios.post(
        "http://localhost:8000/api/order/find",
        { orderType: ["INTRADAY", "FNO"] },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          }
        }
      );
      
      console.log("Positions API response:", response.data);
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid response format from server');
      }
      
      setPositions(response.data);
    } catch (error) {
      console.error("Error fetching positions:", error);
      setError(error.response?.data?.message || error.message || "Failed to fetch positions");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchPositions();
    // Set up interval to fetch real-time updates
    const interval = setInterval(fetchPositions, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [fetchPositions]);
  return (

    <div className="positions-container">
      <h3 className="title">Positions ({positions.length})</h3>
      
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading positions...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {!loading && !error && positions.length === 0 && (
        <div className="no-data-message">
          No positions found
        </div>
      )}

      {!loading && !error && positions.length > 0 && (
        <div className="order-table">
          <table className="holdings-table">
            <thead>
              <tr>
                <th>Instrument</th>
                <th>Qty.</th>
                <th>Avg. cost</th>
                <th>LTP</th>
                <th>Cur. val</th>
                <th>P&L</th>
                <th>Net chg.</th>
                <th>Day chg.</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((stock, index) => {
                const curValue = stock.quantity * stock.actualPrice;
                const profitValue = (stock.actualPrice - stock.purchasePrice) * stock.quantity;
                const isProfit = profitValue >= 0;
                const profClass = isProfit ? "profit" : "loss";

                return (
                  <tr key={index} className="holdings-row">
                    <td className="instrument-cell">{`${stock.symbol} - ${stock.name}`}</td>
                    <td className="quantity-cell">{stock.quantity}</td>
                    <td className="price-cell">{stock.purchasePrice}</td>
                    <td className="price-cell">{stock.actualPrice.toFixed(2)}</td>
                    <td className="value-cell">{curValue.toFixed(2)}</td>
                    <td className={`pnl-cell ${profClass}`}>{profitValue.toFixed(2)}</td>
                    <td className={`change-cell ${profClass}`}>
                      {(((stock.actualPrice - stock.purchasePrice) / stock.purchasePrice) * 100).toFixed(2)}%
                    </td>
                    <td className={`day-change-cell ${profClass}`}>{stock.changePercent}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && positions.length > 0 && (
        <div className="row">
          <div className="col">
            <h5>
              ${positions.reduce((sum, stock) => sum + (stock.quantity * stock.purchasePrice), 0).toFixed(2)}
            </h5>
            <p>Total investment</p>
          </div>
          <div className="col">
            <h5>
              ${positions.reduce((sum, stock) => sum + (stock.quantity * stock.actualPrice), 0).toFixed(2)}
            </h5>
            <p>Current value</p>
          </div>
          <div className="col">
            {(() => {
              const totalInvestment = positions.reduce((sum, stock) => sum + (stock.quantity * stock.purchasePrice), 0);
              const currentValue = positions.reduce((sum, stock) => sum + (stock.quantity * stock.actualPrice), 0);
              const profit = currentValue - totalInvestment;
              const profitPercentage = ((profit / totalInvestment) * 100).toFixed(2);
              return (
                <h5 style={{ color: profit > 0 ? "green" : "red" }}>
                  ${profit.toFixed(2)} ({profit > 0 ? `+${profitPercentage}%` : `${profitPercentage}%`})
                </h5>
              );
            })()}
            <p>P&L</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Positions;
