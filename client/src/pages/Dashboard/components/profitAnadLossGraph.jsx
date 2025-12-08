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

// Styles object
const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(to bottom right, #f9fafb, #f3f4f6)",
    padding: "24px",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "400px",
    fontSize: "18px",
    color: "#6b7280",
  },
  errorContainer: {
    maxWidth: "600px",
    margin: "0 auto",
    marginTop: "48px",
    padding: "24px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  },
  errorTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#dc2626",
    marginBottom: "8px",
  },
  errorMessage: {
    color: "#6b7280",
    marginBottom: "16px",
  },
  retryButton: {
    background: "#dc2626",
    color: "white",
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  mainContent: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "24px",
  },
  headerTitle: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#111827",
    marginBottom: "4px",
  },
  headerSubtitle: {
    color: "#6b7280",
    fontSize: "14px",
  },
  viewToggle: {
    display: "inline-flex",
    gap: "8px",
    background: "white",
    padding: "4px",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  viewButton: {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "none",
    background: "#3b82f6",
    color: "white",
    cursor: "pointer",
    transition: "all 0.2s",
    fontSize: "14px",
    fontWeight: "500",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  summaryCard: {
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  summaryCardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "12px",
  },
  summaryCardTitle: {
    fontSize: "14px",
    color: "#6b7280",
    fontWeight: "500",
  },
  summaryCardIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryCardValue: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#111827",
    marginBottom: "4px",
  },
  summaryCardFooter: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  summaryCardChange: {
    fontSize: "14px",
    fontWeight: "500",
  },
  noDataContainer: {
    background: "white",
    padding: "48px 24px",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    marginBottom: "24px",
  },
  noDataIcon: {
    width: "64px",
    height: "64px",
    background: "#f3f4f6",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
  },
  noDataTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#111827",
    marginBottom: "8px",
  },
  noDataMessage: {
    color: "#6b7280",
  },
  chartContainer: {
    background: "white",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  chartHeader: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#111827",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  tooltipContainer: {
    background: "white",
    padding: "12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  tooltipDate: {
    fontWeight: "bold",
    marginBottom: "8px",
    color: "#111827",
  },
  tooltipPortfolio: {
    color: "#6b7280",
    fontSize: "14px",
    marginBottom: "8px",
  },
};

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
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch holdings"
      );
    }
  }, [getToken, BASE_URL]);


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

        // Save today's P&L and then fetch history
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
        <div style={styles.tooltipContainer}>
          <p style={styles.tooltipDate}>{data.date}</p>
          <p style={styles.tooltipPortfolio}>
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
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          Loading {selectedView} data...
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <div style={styles.errorTitle}>Error Loading Data</div>
          <div style={styles.errorMessage}>{error}</div>
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
            style={styles.retryButton}
            onMouseOver={(e) => (e.target.style.background = "#b91c1c")}
            onMouseOut={(e) => (e.target.style.background = "#dc2626")}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.mainContent}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>Trading Dashboard</h1>
          <p style={styles.headerSubtitle}>Real-time portfolio performance</p>
        </div>

        <div style={styles.viewToggle}>
          <div style={styles.viewButton}>
            Holdings ({holdingsData.length})
          </div>
        </div>

        {/* Summary Cards */}
        {(currentData.length > 0 || dailyPLHistory.length > 0) && (
          <div style={styles.summaryGrid}>
            {/* Total Investment */}
            <div style={styles.summaryCard}>
              <div style={styles.summaryCardHeader}>
                <span style={styles.summaryCardTitle}>Total Investment</span>
                <div
                  style={{
                    ...styles.summaryCardIcon,
                    background: "#dbeafe",
                  }}
                >
                  <DollarSign size={20} color="#3b82f6" />
                </div>
              </div>
              <div style={styles.summaryCardValue}>
                ${currentTotalInvested.toLocaleString()}
              </div>
            </div>

            {/* Current Value */}
            <div style={styles.summaryCard}>
              <div style={styles.summaryCardHeader}>
                <span style={styles.summaryCardTitle}>Current Value</span>
                <div
                  style={{
                    ...styles.summaryCardIcon,
                    background: "#ddd6fe",
                  }}
                >
                  <Activity size={20} color="#8b5cf6" />
                </div>
              </div>
              <div style={styles.summaryCardValue}>
                ${currentTotalValue.toLocaleString()}
              </div>
            </div>

            {/* Total P&L */}
            <div style={styles.summaryCard}>
              <div style={styles.summaryCardHeader}>
                <span style={styles.summaryCardTitle}>Total P&L</span>
                <div
                  style={{
                    ...styles.summaryCardIcon,
                    background: isProfit ? "#d1fae5" : "#fee2e2",
                  }}
                >
                  {isProfit ? (
                    <TrendingUp size={20} color="#059669" />
                  ) : (
                    <TrendingDown size={20} color="#dc2626" />
                  )}
                </div>
              </div>
              <div style={styles.summaryCardValue}>
                {isProfit ? "+" : ""}$
                {(displayedTotalPL || 0).toLocaleString()}
              </div>
              <div style={styles.summaryCardFooter}>
                <span
                  style={{
                    ...styles.summaryCardChange,
                    color: isProfit ? "#059669" : "#dc2626",
                  }}
                >
                  {currentTotalInvested > 0
                    ? `${isProfit ? "+" : ""}${currentTotalPLPercent.toFixed(
                        2
                      )}%`
                    : ""}
                </span>
                {isProfit ? (
                  <TrendingUp size={16} color="#059669" />
                ) : (
                  <TrendingDown size={16} color="#dc2626" />
                )}
              </div>
            </div>

            {/* Today's P&L */}
            <div style={styles.summaryCard}>
              <div style={styles.summaryCardHeader}>
                <span style={styles.summaryCardTitle}>Today's P&L</span>
                <div
                  style={{
                    ...styles.summaryCardIcon,
                    background: isTodayProfit ? "#d1fae5" : "#fee2e2",
                  }}
                >
                  {isTodayProfit ? (
                    <TrendingUp size={20} color="#059669" />
                  ) : (
                    <TrendingDown size={20} color="#dc2626" />
                  )}
                </div>
              </div>
              <div
                style={{
                  ...styles.summaryCardValue,
                  color: isTodayProfit ? "#059669" : "#dc2626",
                }}
              >
                {isTodayProfit ? "+" : ""}$
                {Number(todayDelta).toLocaleString()}
              </div>
              <div style={styles.summaryCardFooter}>
                {isTodayProfit ? (
                  <TrendingUp size={16} color="#059669" />
                ) : (
                  <TrendingDown size={16} color="#dc2626" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* No Data Message */}
        {currentData.length === 0 && dailyPLHistory.length === 0 && (
          <div style={styles.noDataContainer}>
            <div style={styles.noDataIcon}>
              <Activity size={32} color="#9ca3af" />
            </div>
            <h3 style={styles.noDataTitle}>No {selectedView} Found</h3>
            <p style={styles.noDataMessage}>
              You don't have any {selectedView.toLowerCase()} at the moment.
            </p>
          </div>
        )}

        {/* Daily P&L Chart - Always shown */}
        <div style={styles.chartContainer}>
          <h2 style={styles.chartHeader}>
            <Activity size={20} />
            {selectedView} Daywise P&L
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="portfolioValue"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 4 }}
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