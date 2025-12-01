import React, { useState, useEffect, useContext } from "react";
import { GeneralContext } from "./GeneralContext";

const Positions = () => {
  const {
    positions,
    positionLoading,
    positionsError,
    getUserPositions,
    handleSellStock,
    findUserFundsData,
  } = useContext(GeneralContext);

  const [isSell, setIsSell] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [quantity, setQuantity] = useState(0);
  const [isSelling, setIsSelling] = useState(false);
  const [showMarketClosedMsg, setShowMarketClosedMsg] = useState(false);

  useEffect(() => {
    getUserPositions();
  }, [getUserPositions]);

  const handleSell = (stock) => {
    setIsSell(true);
    setSelectedStock(stock);
    setQuantity(stock.quantity); // default sell full quantity
  };

  const callStockSell = async (stock, qty) => {
    setIsSelling(true);
    try {
      const res = await handleSellStock(stock, qty);
      if (res?.success) {
        await getUserPositions();
        await findUserFundsData();
        setIsSell(false); // hide modal
      } else {
        console.error("Sell failed:", res?.message);
      }
    } catch (err) {
      console.error("Error in callStockSell:", err);
    } finally {
      setIsSelling(false);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  // ✅ Calculations
  const totalInvestment = positions.reduce(
    (sum, stock) => sum + stock.quantity * stock.purchasePrice,
    0
  );
  const currentValue = positions.reduce(
    (sum, stock) => sum + stock.quantity * stock.actualPrice,
    0
  );
  const profit = currentValue - totalInvestment;
  const profitPercentage = totalInvestment
    ? ((profit / totalInvestment) * 100).toFixed(2)
    : 0;

  return (
    <div style={{ padding: "20px" }}>
      <h3 style={{ marginBottom: "20px" }}>Positions ({positions.length})</h3>

      {/* Loading */}
      {positionLoading && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "200px",
          }}
        >
          <div
            style={{
              width: "50px",
              height: "50px",
              border: "6px solid #f3f3f3",
              borderTop: "6px solid #387ed1",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <p>Loading positions...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {/* Error */}
      {positionsError && (
        <div style={{ color: "red", marginBottom: "20px" }}>
          {positionsError}{" "}
          <button
            onClick={getUserPositions}
            style={{
              marginLeft: "10px",
              padding: "6px 12px",
              cursor: "pointer",
              borderRadius: "6px",
              border: "none",
              background: "#387ed1",
              color: "#fff",
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* No Data */}
      {!positionLoading && !positionsError && positions.length === 0 && (
        <div>No positions found</div>
      )}

      {/* Table */}
      {!positionLoading && !positionsError && positions.length > 0 && (
        <div style={{ overflowX: "auto", marginBottom: "20px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {[
                  "Instrument",
                  "Qty.",
                  "Avg. cost",
                  "LTP",
                  "Cur. val",
                  "P&L",
                  "Net chg.",
                  "Day chg.",
                  "Action",
                ].map((th) => (
                  <th
                    key={th}
                    style={{
                      textAlign: "left",
                      padding: "8px",
                      borderBottom: "1px solid #ccc",
                    }}
                  >
                    {th}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {positions.map((stock, index) => {
                const curValue = stock.quantity * stock.actualPrice;
                const profitValue =
                  (stock.actualPrice -
                    (stock.purchasePrice == stock.actualPrice / 2
                      ? stock.purchasePrice * 2
                      : stock.purchasePrice)) *
                  stock.quantity;
                const isProfit = profitValue >= 0;

                return (
                  <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
                    <td
                      style={{ padding: "8px" }}
                    >{`${stock.symbol} - ${stock.name}`}</td>
                    <td style={{ padding: "8px" }}>{stock.quantity}</td>
                    <td style={{ padding: "8px" }}>
                      {formatNumber(
                        stock.orderMode == "LIMIT"
                          ? stock.purchasePrice
                          : stock.actualPrice
                      )}
                    </td>
                    <td
                      style={{
                        padding: "8px",
                        color: stock.actualPrice >= stock.purchasePrice,
                        // ? "green"
                        // : "red",
                      }}
                    >
                      {formatNumber(stock.actualPrice)}
                    </td>
                    <td style={{ padding: "8px" }}>{formatNumber(curValue)}</td>
                    <td
                      style={{
                        padding: "8px",
                        color: isProfit ? "green" : "red",
                      }}
                    >
                      {formatNumber(profitValue)}
                    </td>
                    <td
                      style={{
                        padding: "8px",
                        color: isProfit ? "green" : "red",
                      }}
                    >
                      {/* {(stock.orderMode == "LIMIT" ? (((stock.actualPrice - stock.purchasePrice) / (stock.actualPrice)) * 100).toFixed(2) : (stock.actualPrice - (stock.purchasePrice*2)) / (stock.purchasePrice) * 100).toFixed(2)} % */}
                      {(
                        ((stock.actualPrice -
                          (stock.purchasePrice == stock.actualPrice / 2
                            ? stock.purchasePrice * 2
                            : stock.purchasePrice)) /
                          stock.purchasePrice) *
                        100
                      ).toFixed(2)}
                    </td>
                    <td
                      style={{
                        padding: "8px",
                        color: stock.changePercent >= 0 ? "green" : "red",
                      }}
                    >
                      {stock.changePercent.toFixed(2)}%
                    </td>
                    <td style={{ padding: "8px" }}>
                      <button
                        style={{
                          background:
                            "linear-gradient(135deg,#f30909 0%,#e80606 100%)",
                          color: "white",
                          border: "1px solid #f4511e",
                          borderRadius: "6px",
                          padding: "8px 16px",
                          fontSize: "14px",
                          fontWeight: "600",
                          cursor: "pointer",
                          boxShadow: "0 2px 8px rgba(255,87,34,0.3)",
                          transition: "all 0.2s ease-in-out",
                        }}
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
      )}

      {/* Summary */}
      {/* Summary */}
      {!positionLoading && !positionsError && positions.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "20px",
            marginTop: "20px",
            flexWrap: "wrap",
          }}
        >
          {/* Total Investment */}
          <div
            style={{
              flex: "1",
              minWidth: "150px",
              background: "#f5f5f5",
              padding: "15px 20px",
              borderRadius: "10px",
              textAlign: "center",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            <h5 style={{ margin: "0 0 5px 0" }}>
              ${formatNumber(totalInvestment)}
            </h5>
            <p style={{ margin: 0, fontSize: "14px", color: "#555" }}>
              Total investment
            </p>
          </div>

          {/* Current Value */}
          <div
            style={{
              flex: "1",
              minWidth: "150px",
              background: "#f5f5f5",
              padding: "15px 20px",
              borderRadius: "10px",
              textAlign: "center",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            <h5 style={{ margin: "0 0 5px 0" }}>
              ${formatNumber(currentValue)}
            </h5>
            <p style={{ margin: 0, fontSize: "14px", color: "#555" }}>
              Current value
            </p>
          </div>

          {/* P&L */}
          <div
            style={{
              flex: "1",
              minWidth: "150px",
              background: "#f5f5f5",
              padding: "15px 20px",
              borderRadius: "10px",
              textAlign: "center",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            <h5
              style={{
                margin: "0 0 5px 0",
                color: profit > 0 ? "green" : "red",
              }}
            >
              {profit > 0 ? "+" : ""}
              {formatNumber(profit)} (
              {profit > 0 ? `+${profitPercentage}%` : `${profitPercentage}%`})
            </h5>
            <p style={{ margin: 0, fontSize: "14px", color: "#555" }}>P&L</p>
          </div>
        </div>
      )}

      {/* Sell Modal */}
      {isSell && selectedStock && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
          onClick={() => setIsSelling(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "20px",
              width: "420px",
              maxWidth: "90%",
              boxShadow: "0px 8px 25px rgba(0,0,0,0.3)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "15px",
              }}
            >
              <h3>Sell Position</h3>
              <button
                onClick={() => setIsSell(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "22px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                background: "#f8f9fa",
                padding: "10px",
                borderRadius: "8px",
                marginBottom: "15px",
              }}
            >
              <div style={{ fontWeight: 600 }}>
                {selectedStock.symbol} - {selectedStock.name}
              </div>
              <div>Available: {selectedStock.quantity}</div>
              <div>
                Current Price: ${formatNumber(selectedStock.actualPrice)}
              </div>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label>Quantity to Sell:</label>
              <input
                type="number"
                value={quantity}
                min="1"
                max={selectedStock.quantity}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val === 0) {
                    setQuantity(""); // remove input if user types 0
                  } else {
                    setQuantity(val);
                  }
                }}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  marginTop: "5px",
                }}
              />

              {quantity > selectedStock.quantity && (
                <div style={{ color: "red", marginTop: "5px" }}>
                  Quantity exceeds available shares
                </div>
              )}
            </div>

            {/* Show market closed message */}
            {showMarketClosedMsg && (
              <div style={{ color: "red", marginBottom: "10px" }}>
                Stock market is closed. Please try again during market hours
                (Mon–Fri, 9:30 AM – 4:00 PM).
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                disabled={
                  !quantity ||
                  quantity <= 0 ||
                  quantity > selectedStock.quantity ||
                  isSelling
                }
                style={{
                  background:
                    !quantity ||
                    quantity <= 0 ||
                    quantity > selectedStock.quantity ||
                    isSelling
                      ? "#ccc"
                      : "linear-gradient(135deg,#e74c3c,#c0392b)",
                  color: "white",
                  padding: "10px 18px",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: 600,
                  cursor:
                    !quantity ||
                    quantity <= 0 ||
                    quantity > selectedStock.quantity ||
                    isSelling
                      ? "not-allowed"
                      : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
                onClick={() => {
                  // Compute IST reliably from current UTC time (avoid locale parsing)
                  const now = new Date();
                  const utcMillis = now.getTime() + now.getTimezoneOffset() * 60000;
                  const istOffsetMinutes = 5 * 60 + 30; // IST = UTC +5:30
                  const istNow = new Date(utcMillis + istOffsetMinutes * 60000);

                  const day = istNow.getDay(); // 0=Sun, 6=Sat
                  const hour = istNow.getHours();
                  const minutes = istNow.getMinutes();

                  // Market hours (IST) — enforce: Mon–Fri, 9:15 AM to 3:30 PM
                  const openMinutes = 9 * 60 + 15; // 9:15 AM IST
                  const closeMinutes = 15 * 60 + 30; // 3:30 PM IST
                  const currentMinutes = hour * 60 + minutes;

                  const isWeekend = day === 0 || day === 6;
                  const marketOpen = !isWeekend && currentMinutes >= openMinutes && currentMinutes <= closeMinutes;

                  if (!marketOpen) {
                    setShowMarketClosedMsg(true);
                    return; // block sell when market closed
                  }

                  setShowMarketClosedMsg(false);
                  callStockSell(selectedStock, quantity);
                }}
              >
                {isSelling && (
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      border: "2px solid #fff",
                      borderTop: "2px solid transparent",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                )}
                {isSelling ? "Selling..." : "Confirm Sell"}
              </button>
              <button
                onClick={() => setIsSell(false)}
                style={{
                  background: "#ddd",
                  padding: "10px 18px",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Positions;
