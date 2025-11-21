import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { useContext } from "react";
import { GeneralContext } from "./GeneralContext";

const ProfitAndLossGraph = () => {
  const selectedView = "Holdings"; 
  const [holdingsData, setHoldingsData] = useState([]);
  const [positionsData, setPositionsData] = useState([]);
  const [dailyPLHistory, setDailyPLHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const { saveDailyPL } = useContext(GeneralContext);

  // Fetch Holdings data (DELIVERY orders)
  const fetchHoldings = useCallback(async () => {
    try {
      const authToken = await getToken();
      const response = await axios.get(
        `${BASE_URL}/api/order/get-user-order?type=DELIVERY`,
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
      setHoldingsData(response.data);
      return response.data;
    } catch (err) {
      console.error("Error fetching holdings:", err);
      setHoldingsData([]);
      setError(
        err.response?.data?.message || err.message || "Failed to fetch holdings"
      );
    }
  }, [getToken, BASE_URL]);

  // Fetch Positions data (FNO, INTRADAY orders)
  const fetchPositions = useCallback(async () => {
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
      setPositionsData(response.data);
      return response.data;
    } catch (err) {
      console.error("Error fetching positions:", err);
      setPositionsData([]);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch positions"
      );
    }
  }, [getToken, BASE_URL]);

  // Fetch daily P&L history for the authenticated user
  const fetchDailyPL = useCallback(async () => {
    try {
      const authToken = await getToken();
      const response = await axios.get(
        `${BASE_URL}/api/financial/daily-pl/holdings`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.data.data || !Array.isArray(response.data.data)) {
        setDailyPLHistory([]);
        return;
      }
      setDailyPLHistory(response.data.data || []);
    } catch (err) {
      console.error("Error fetching daily P&L history:", err);
      setDailyPLHistory([]);
      // Don't set error for daily PL - it's optional data
    }
  }, [getToken, BASE_URL]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [holdingsResponse] = await Promise.all([
          fetchHoldings(),
          fetchPositions(),
        ]);

     

        const holdingsArray =
          holdingsResponse && Array.isArray(holdingsResponse)
            ? holdingsResponse
            : [];

        const totalInvestment = holdingsArray.reduce(
          (sum, stock) => sum + (stock.totalAmount || 0),
          0
        );
      

        const currentValue = holdingsArray.reduce(
          (sum, stock) => sum + stock.quantity * stock.actualPrice,
          0
        );
        

        const profit = currentValue - totalInvestment;
        const pl = Number(profit);
        const date = new Date().toISOString().slice(0, 10);

        // Save today’s P&L and then fetch history
        await saveDailyPL(pl, date);
       
        await fetchDailyPL();
      } catch (error) {
        setError(error.message);
      }
      setLoading(false);
    };

    fetchData();

    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchHoldings, fetchPositions, fetchDailyPL]);

  // Build chart data with fallback to zero point
  const chartData = useMemo(() => {

    // If backend history is available, use that to plot daywise profit
    if (
      dailyPLHistory &&
      Array.isArray(dailyPLHistory) &&
      dailyPLHistory.length > 0
    ) {
      // Sort by date to ensure proper order
      const sortedHistory = dailyPLHistory
        .slice()
        .sort((a, b) => (a.date || "").localeCompare(b.date || ""));

      // Build points array with Daily P&L calculated as difference from previous Total P&L
      const points = [];
      for (let i = 0; i < sortedHistory.length; i++) {
        const current = sortedHistory[i];
        const totalPL = Number(current.totalPL) || 0;

        // Calculate Daily P&L: current total - previous total
        let dailyPL = 0;
        if (i === 0) {
          // First day: Daily P&L equals Total P&L
          dailyPL = totalPL;
        } else {
          const previousTotalPL = Number(sortedHistory[i - 1].totalPL) || 0;
          dailyPL = totalPL - previousTotalPL;
        }

        // Format date for display
        const dateObj = new Date(current.date);
        const formatted = isNaN(dateObj.getTime())
          ? current.date
          : dateObj.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });

        points.push({
          date: formatted,
          isoDate: current.date,
          dailyPL: dailyPL,
          totalPL: totalPL,
          portfolioValue: totalPL,
        });
      }

      // console.log("Processed chart data points:", points);
      return points;
    }

    // Fallback: return a single point at zero for today
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    // console.log("No data available, returning zero point");
    return [
      {
        date: formattedDate,
        isoDate: today.toISOString().split("T")[0],
        dailyPL: 0,
        totalPL: 0,
        portfolioValue: 0,
      },
    ];
  }, [dailyPLHistory]);

  // Calculate current totals from real data
  const currentData =
    selectedView === "Holdings" ? holdingsData : positionsData;
  const currentTotalInvested = currentData.reduce((sum, stock) => {
    return (
      sum +
      (selectedView === "Holdings"
        ? stock.totalAmount || stock.quantity * stock.purchasePrice
        : stock.quantity * stock.purchasePrice)
    );
  }, 0);

  const currentTotalValue = currentData.reduce(
    (sum, stock) => sum + stock.quantity * stock.actualPrice,
    0
  );

  const currentTotalPL = currentTotalValue - currentTotalInvested;
  const currentTotalPLPercent =
    currentTotalInvested > 0
      ? (currentTotalPL / currentTotalInvested) * 100
      : 0;

  // If history is available, prefer it for displayed totals
  const historyLast =
    dailyPLHistory && dailyPLHistory.length > 0
      ? dailyPLHistory[dailyPLHistory.length - 1]
      : null;
  const historyPrev =
    dailyPLHistory && dailyPLHistory.length > 1
      ? dailyPLHistory[dailyPLHistory.length - 2]
      : null;

  const historyTodayPL = historyLast
    ? Number(historyLast.totalPL) -
      (historyPrev ? Number(historyPrev.totalPL) : 0)
    : null;

  const displayedTotalPL = currentTotalPL.toFixed(2);
  const isProfit = displayedTotalPL >= 0;

  // Determine today's P&L
  const todayDelta = (() => {
    // Prefer server-provided daily diff when available
    if (historyLast) return Number(historyTodayPL || 0);
    if (!Array.isArray(chartData) || chartData.length === 0) return 0;
    if (chartData.length === 1) return chartData[0].totalPL || 0;
    const last = chartData[chartData.length - 1].totalPL || 0;
    const prev = chartData[chartData.length - 2].totalPL || 0;
    return Number(last) - Number(prev);
  })();

  const isTodayProfit = todayDelta >= 0;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          style={{
            background: "#fff",
            border: "1px solid #d1d5db",
            padding: "12px",
            borderRadius: "8px",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          }}
        >
          <p style={{ color: "black", fontWeight: "600", margin: "0 0 4px 0" }}>
            {data.date}
          </p>
          <p
            style={{ color: "#4b5563", fontSize: "14px", margin: "0 0 4px 0" }}
          >
            Portfolio: ${data.portfolioValue.toLocaleString()}
          </p>
          <p
            style={{
              color: data.dailyPL >= 0 ? "#059669" : "#dc2626",
              fontSize: "14px",
              margin: "0 0 4px 0",
            }}
          >
            Daily P&L: {data.dailyPL >= 0 ? "+" : ""}$
            {data.dailyPL.toLocaleString()}
          </p>
          <p
            style={{
              color: data.totalPL >= 0 ? "#059669" : "#dc2626",
              fontSize: "14px",
              margin: 0,
            }}
          >
            Total P&L: {data.totalPL >= 0 ? "+" : ""}$
            {data.totalPL.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  // Loading state
  if (loading) {
    return (
      <div
        style={{
          minHeight: "400px",
          background: "#f5f5f5",
          padding: "24px",
          borderRadius: "12px",
          margin: "20px 0",
          border: "1px solid #e5e7eb",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "300px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  border: "4px solid #e5e7eb",
                  borderTop: "4px solid #2563eb",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 16px",
                }}
              ></div>
              <p style={{ color: "#4b5563", margin: 0 }}>
                Loading {selectedView} data...
              </p>
            </div>
          </div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        style={{
          minHeight: "400px",
          background: "#f5f5f5",
          padding: "24px",
          borderRadius: "12px",
          margin: "20px 0",
          border: "1px solid #e5e7eb",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid #ef4444",
              borderRadius: "12px",
              padding: "24px",
              textAlign: "center",
            }}
          >
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                color: "#dc2626",
                margin: "0 0 8px 0",
              }}
            >
              Error Loading Data
            </h2>
            <p style={{ color: "#4b5563", margin: "0 0 16px 0" }}>{error}</p>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                Promise.all([
                  fetchHoldings(),
                  fetchPositions(),
                  fetchDailyPL(),
                ]).finally(() => setLoading(false));
              }}
              style={{
                background: "#dc2626",
                color: "white",
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseOver={(e) => (e.target.style.background = "#b91c1c")}
              onMouseOut={(e) => (e.target.style.background = "#dc2626")}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "400px",
        background: "#f5f5f5",
        padding: "24px",
        borderRadius: "12px",
        margin: "20px 0",
        border: "1px solid #e5e7eb",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            marginBottom: "32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                color: "black",
                margin: "0 0 8px 0",
              }}
            >
              Trading Dashboard
            </h1>
            <p style={{ color: "#4b5563", margin: 0 }}>
              Real-time portfolio performance
            </p>
          </div>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "8px",
            background: "#fff",
            padding: "8px 16px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb"
          }}>
            <span style={{ 
              fontSize: "14px", 
              fontWeight: "600", 
              color: "#1f2937" 
            }}>
              Holdings
            </span>
            <span style={{ 
              fontSize: "14px", 
              fontWeight: "500", 
              color: "#6b7280",
              background: "#f3f4f6",
              padding: "2px 8px",
              borderRadius: "4px"
            }}>
              ({holdingsData.length})
            </span>
          </div>
        </div>

        {/* Summary Cards */}
        {(currentData.length > 0 || dailyPLHistory.length > 0) && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "24px",
              marginBottom: "32px",
            }}
          >
            {/* Total Investment */}
            <div
              style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "24px",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <p
                    style={{
                      color: "#4b5563",
                      fontSize: "14px",
                      margin: "0 0 8px 0",
                    }}
                  >
                    Total Investment
                  </p>
                  <p
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      color: "black",
                      margin: 0,
                    }}
                  >
                    ${currentTotalInvested.toLocaleString()}
                  </p>
                </div>
                <DollarSign
                  style={{ width: "32px", height: "32px", color: "#2563eb" }}
                />
              </div>
            </div>

            {/* Current Value */}
            <div
              style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "24px",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <p
                    style={{
                      color: "#4b5563",
                      fontSize: "14px",
                      margin: "0 0 8px 0",
                    }}
                  >
                    Current Value
                  </p>
                  <p
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      color: "black",
                      margin: 0,
                    }}
                  >
                    ${currentTotalValue.toLocaleString()}
                  </p>
                </div>
                <Activity
                  style={{ width: "32px", height: "32px", color: "#059669" }}
                />
              </div>
            </div>

            {/* Total P&L */}
            <div
              style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "24px",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <p
                    style={{
                      color: "#4b5563",
                      fontSize: "14px",
                      margin: "0 0 8px 0",
                    }}
                  >
                    Total P&L
                  </p>
                  <p
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      color: isProfit ? "#059669" : "#dc2626",
                      margin: 0,
                    }}
                  >
                    {isProfit ? "+" : ""}$
                    {(displayedTotalPL || 0).toLocaleString()}
                  </p>
                  <p
                    style={{
                      fontSize: "14px",
                      color: isProfit ? "#059669" : "#dc2626",
                      margin: "4px 0 0 0",
                    }}
                  >
                    {currentTotalInvested > 0
                      ? `${isProfit ? "+" : ""}${currentTotalPLPercent.toFixed(
                          2
                        )}%`
                      : ""}
                  </p>
                </div>
                {isProfit ? (
                  <TrendingUp
                    style={{ width: "32px", height: "32px", color: "#059669" }}
                  />
                ) : (
                  <TrendingDown
                    style={{ width: "32px", height: "32px", color: "#dc2626" }}
                  />
                )}
              </div>
            </div>

            {/* Today's P&L */}
            <div
              style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "24px",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <p
                    style={{
                      color: "#4b5563",
                      fontSize: "14px",
                      margin: "0 0 8px 0",
                    }}
                  >
                    Today's P&L
                  </p>
                  <p
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      color: isTodayProfit ? "#059669" : "#dc2626",
                      margin: 0,
                    }}
                  >
                    {isTodayProfit ? "+" : ""}$
                    {Number(todayDelta).toLocaleString()}
                  </p>
                </div>
                {isTodayProfit ? (
                  <TrendingUp
                    style={{ width: "32px", height: "32px", color: "#059669" }}
                  />
                ) : (
                  <TrendingDown
                    style={{ width: "32px", height: "32px", color: "#dc2626" }}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* No Data Message */}
        {currentData.length === 0 && dailyPLHistory.length === 0 && (
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "24px",
              border: "1px solid #e5e7eb",
              textAlign: "center",
              marginBottom: "32px",
            }}
          >
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                color: "black",
                margin: "0 0 8px 0",
              }}
            >
              No {selectedView} Found
            </h2>
            <p style={{ color: "#4b5563", margin: 0 }}>
              You don't have any {selectedView.toLowerCase()} at the moment.
            </p>
          </div>
        )}

        {/* Daily P&L Chart - Always shown */}
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "24px",
            border: "1px solid #e5e7eb",
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "black",
              margin: "0 0 24px 0",
            }}
          >
            {selectedView} Daywise P&L
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                stroke="#4b5563"
                style={{ fontSize: "12px" }}
              />
              <YAxis stroke="#4b5563" style={{ fontSize: "12px" }} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="dailyPL"
                stroke={isProfit ? "#059669" : "#dc2626"}
                strokeWidth={2}
                dot={{ fill: isProfit ? "#059669" : "#dc2626", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ProfitAndLossGraph;
