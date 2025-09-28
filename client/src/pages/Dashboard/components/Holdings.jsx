import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
// import { VerticalGraph } from "./VerticalGraph";
import './dashboard.css'


const Holdings = () => {
  const [allHoldings, setAllHoldings] = useState([]);
  const [isSell , SetIsSell] = useState(false);
  const [quantity , setQuantity] = useState(0);
  const [selectedStock , setSelectedStock] = useState(null);
  const {getToken} = useAuth();

  const findOrder = useCallback(async () => {
    try {
      const authToken = await getToken();
      const response = await axios.post(
        "http://localhost:8000/api/order/find", 
        { 
          orderType: "DELIVERY",
          isSettled: true,
          inDematAccount: true 
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          }
        }
      );
      console.log("Delivery orders fetched successfully:", response.data);
      setAllHoldings(response.data);
    } catch (error) {
      console.error("Error fetching delivery orders:", error.response?.data || error.message);
    }
  }, [getToken]);

  const handleSell = async (stock) => {
     SetIsSell(true);
     setSelectedStock(stock);
  };

  useEffect(() => {
    findOrder();
  }, [findOrder])

  const calInvestment = () => {
    let sum = 0;
    allHoldings.forEach(stock => {
      sum += stock.totalAmount || 0;
    });
    return sum;
  };

  const calActualValue = () => {
    let currVal = 0;
    allHoldings.forEach(stock => currVal += stock.quantity * stock.actualPrice);
    return currVal.toFixed(2);
  }

  const profit = (calActualValue() - calInvestment()).toFixed(2);
  const profitPercentage = ((profit / calInvestment()) * 100).toFixed(2);

  return (
    <div className="dashboard-section">
      <h3 className="title">Holdings ({allHoldings.length})</h3>

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
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {allHoldings.map((stock, index) => {
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
                  <td className="action-cell">
                    <button 
                      className="sell-button"
                      onClick={() => handleSell(stock)}
                    >
                      Sell
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>

        </table>
      </div>

      {isSell && selectedStock && (
        <div className="sell-form-overlay">
          <div className="sell-form-container" onClick={(e) => e.stopPropagation()}>
            <div className="sell-form-header">
              <h3 className="sell-form-title">Sell Stock</h3>
              <button className="close-button-x" onClick={()=>SetIsSell(false) } >
                ×
              </button>
            </div>
            
            <div className="sell-form-content">
              <div className="stock-info-display">
                <div className="stock-symbol">{selectedStock.symbol} - {selectedStock.name}</div>
                <div className="stock-available">Available: {selectedStock.quantity} shares</div>
                <div className="stock-available">Current Price: ${selectedStock.actualPrice.toFixed(2)}</div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Quantity to Sell:</label>
                <input
                  type="number"
                  className="form-input"
                  value={quantity}
                  min="1"
                  max={selectedStock.quantity}
                  placeholder="Enter quantity"
                  onChange={(e) => setQuantity(e.target.value)}
                />
                {quantity > selectedStock.quantity && (
                  <span className="error-message">Quantity exceeds available shares</span>
                )}
              </div>
            </div>
            
            <div className="form-buttons">
              <button 
                className="sell-confirm-button"
               
                disabled={!quantity || quantity <= 0 || quantity > selectedStock.quantity}
              >
                Confirm Sell
              </button>
              <button className="close-btn" >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

     




      <div className="row">
        <div className="col">
          <h5>
            ${calInvestment()}.{" "}
          </h5>
          <p>Total investment</p>
        </div>
        <div className="col">
          <h5>
            ${calActualValue()}.{" "}
          </h5>
          <p>Current value</p>
        </div>
        <div className="col">
          <h5 style={{ color: profit > 0 ? "green" : "red" }}>
            ${profit} ({profit > 0 ? `+${profitPercentage}%` : `${profitPercentage}%`})
          </h5>
          <p>P&L</p>
        </div>
      </div>
      {/* <VerticalGraph data={data} /> */}
    </div>
  );
};

export default Holdings;