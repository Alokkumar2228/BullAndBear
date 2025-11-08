import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

const ProfitAndLossGraph = () => {
  const [selectedView, setSelectedView] = useState('Holdings'); // Dropdown selection
  const [holdingsData, setHoldingsData] = useState([]);
  const [positionsData, setPositionsData] = useState([]);
  const [dailyPLHistory, setDailyPLHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();

  const BASE_URL = import.meta.env.VITE_BASE_URL;

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
    } catch (err) {
      console.error("Error fetching holdings:", err);
      setHoldingsData([]);
      setError(err.response?.data?.message || err.message || "Failed to fetch holdings");
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
    } catch (err) {
      console.error("Error fetching positions:", err);
      setPositionsData([]);
      setError(err.response?.data?.message || err.message || "Failed to fetch positions");
    }
  }, [getToken, BASE_URL]);

  // Fetch daily P&L history for the authenticated user
  const fetchDailyPL = useCallback(async () => {
    try {
      const authToken = await getToken();
      const response = await axios.get(
        `${BASE_URL}/api/financial/daily-pl`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data || !Array.isArray(response.data)) {
        setDailyPLHistory([]);
        return;
      }

      setDailyPLHistory(response.data);
    } catch (err) {
      console.error("Error fetching daily P&L history:", err);
      setDailyPLHistory([]);
      setError(err.response?.data?.message || err.message || "Failed to fetch daily P&L history");
    }
  }, [getToken, BASE_URL]);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      await Promise.all([fetchHoldings(), fetchPositions(), fetchDailyPL()]);
      setLoading(false);
    };
    
  fetchData();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchHoldings, fetchPositions, fetchDailyPL]);


  // Helper: compute a sensible change percent for a stock (Option A)
  const computeChangePercent = (stock) => {
    // Prefer explicit changePercent
    if (stock.changePercent !== undefined && stock.changePercent !== null) {
      return Number(stock.changePercent) || 0;
    }
    // Fallback: prevClose field if provided
    if (stock.prevClose) {
      const prev = Number(stock.prevClose) || 0;
      const actual = Number(stock.actualPrice) || 0;
      if (prev > 0) return ((actual - prev) / prev) * 100;
    }
    // Last-resort fallback: compute from purchasePrice (only meaningful for holdings)
    if (stock.purchasePrice) {
      const purchase = Number(stock.purchasePrice) || 0;
      const actual = Number(stock.actualPrice) || 0;
      if (purchase > 0) return ((actual - purchase) / purchase) * 100;
    }
    return 0;
  };

  // Build chart data: prefer backend daily P&L history; otherwise synthesize from holdings/positions
  const chartData = useMemo(() => {
    // If backend history is available, use that to plot daywise profit
    if (dailyPLHistory && Array.isArray(dailyPLHistory) && dailyPLHistory.length > 0) {
      const hist = dailyPLHistory.slice().sort((a, b) => (a.date || '').localeCompare(b.date || ''));
      const points = [];
      let prevTotal = 0;
      for (const r of hist) {
        const totalPL = Number(r.totalPL) || 0;
        const dailyPL = totalPL - prevTotal;
        prevTotal = totalPL;
        const dateObj = new Date(r.date);
        const formatted = isNaN(dateObj.getTime())
          ? r.date
          : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        points.push({
          date: formatted,
          isoDate: r.date,
          dailyPL,
          totalPL,
          portfolioValue: totalPL,
        });
      }
      return points;
    }

    // Fallback: synthesize series from holdings/positions (existing behavior)
    const data = selectedView === 'Holdings' ? holdingsData : positionsData;
    if (!data || data.length === 0) return [];

    // Build per-stock metadata and collect symbols
    const stocks = data.map(stock => {
      const quantity = Number(stock.quantity) || 0;
      const actualPrice = Number(stock.actualPrice) || Number(stock.price) || 0;
      const purchasePrice = Number(stock.purchasePrice) || Number(stock.price) || 0;
      const invested = selectedView === 'Holdings' ? (stock.totalAmount || quantity * purchasePrice) : (quantity * purchasePrice);
      const changePercent = computeChangePercent(stock);
      return { ...stock, quantity, actualPrice, purchasePrice, invested, changePercent };
    });

    // Determine date range
    const parseDate = (val) => { if (!val) return null; const d = new Date(val); return isNaN(d.getTime()) ? null : d; };
    let earliest = null;
    for (const s of data) {
      const candidates = [s.placedAt, s.purchaseDate, s.createdAt, s.orderDate];
      for (const c of candidates) {
        const d = parseDate(c);
        if (d && (!earliest || d < earliest)) earliest = d;
      }
    }
    if (!earliest) { earliest = new Date(); earliest.setDate(earliest.getDate() - 6); }

    const today = new Date();
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysSpan = Math.max(1, Math.ceil((today.setHours(0,0,0,0) - earliest.setHours(0,0,0,0)) / msPerDay) + 1);

    // Build per-day aggregated series (synthesized from purchasePrice -> actualPrice)
    const points = [];
    for (let j = 0; j < daysSpan; j++) {
      const date = new Date(earliest);
      date.setDate(earliest.getDate() + j);
      const isoDate = date.toISOString().slice(0,10); // YYYY-MM-DD

      // For each stock, get price for isoDate: prefer historical, otherwise synthesize linearly from purchasePrice -> actualPrice
      let dayTotalInvested = 0;
      let dayCurrentValue = 0;
      let dayDailyPL = 0;

      for (const s of stocks) {
        const qty = s.quantity || 0;
        let priceOnDate = null;

        // synthesize between purchasePrice (at earliest) to actualPrice (today)
        const start = Number(s.purchasePrice) || Number(s.price) || 0;
        const end = Number(s.actualPrice) || 0;
        const t = daysSpan > 1 ? (j / (daysSpan - 1)) : 1;
        priceOnDate = start + (end - start) * t;

        const investedAtPurchase = selectedView === 'Holdings' ? (s.totalAmount || (qty * s.purchasePrice)) : (qty * s.purchasePrice);
        const currentVal = qty * priceOnDate;
        const dailyPL = currentVal - investedAtPurchase;

        dayTotalInvested += investedAtPurchase;
        dayCurrentValue += currentVal;
        dayDailyPL += dailyPL;
      }

      points.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        isoDate,
        dailyPL: dayDailyPL,
        totalPL: dayCurrentValue - dayTotalInvested,
        portfolioValue: dayCurrentValue,
        totalInvested: dayTotalInvested,
        totalCurrentValue: dayCurrentValue,
      });
    }

    return points;
  }, [selectedView, holdingsData, positionsData, dailyPLHistory]);

  // Calculate current totals from real data
  const currentData = selectedView === 'Holdings' ? holdingsData : positionsData;
  const currentTotalInvested = currentData.reduce((sum, stock) => {
    return sum + (selectedView === 'Holdings' 
      ? (stock.totalAmount || stock.quantity * stock.purchasePrice)
      : stock.quantity * stock.purchasePrice);
  }, 0);
  
  const currentTotalValue = currentData.reduce((sum, stock) => sum + (stock.quantity * stock.actualPrice), 0);
  const currentTotalPL = currentTotalValue - currentTotalInvested;
  const currentTotalPLPercent = currentTotalInvested > 0 ? ((currentTotalPL / currentTotalInvested) * 100) : 0;

  // If history is available, prefer it for displayed totals
  const historyLast = (dailyPLHistory && dailyPLHistory.length > 0) ? dailyPLHistory[dailyPLHistory.length - 1] : null;
  const historyPrev = (dailyPLHistory && dailyPLHistory.length > 1) ? dailyPLHistory[dailyPLHistory.length - 2] : null;
  const historyTotalPL = historyLast ? Number(historyLast.totalPL) : null;
  const historyTodayPL = historyLast ? (Number(historyLast.totalPL) - (historyPrev ? Number(historyPrev.totalPL) : 0)) : null;

  const displayedTotalPL = historyLast ? historyTotalPL : currentTotalPL;
  const isProfit = displayedTotalPL >= 0;

  // Determine today's P&L as the difference between today's totalPL and previous day's totalPL (as requested)
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
        <div style={{
          background: '#fff',
          border: '1px solid #d1d5db',
          padding: '12px',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}>
          <p style={{ color: 'black', fontWeight: '600', margin: '0 0 4px 0' }}>{data.date}</p>
          <p style={{ color: '#4b5563', fontSize: '14px', margin: '0 0 4px 0' }}>
            Portfolio: ₹{data.portfolioValue.toLocaleString()}
          </p>
          <p style={{ 
            color: data.dailyPL >= 0 ? '#059669' : '#dc2626', 
            fontSize: '14px', 
            margin: '0 0 4px 0' 
          }}>
            Daily P&L: {data.dailyPL >= 0 ? '+' : ''}₹{data.dailyPL.toLocaleString()}
          </p>
          <p style={{ 
            color: data.totalPL >= 0 ? '#059669' : '#dc2626', 
            fontSize: '14px', 
            margin: 0 
          }}>
            Total P&L: {data.totalPL >= 0 ? '+' : ''}₹{data.totalPL.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ 
        minHeight: '400px', 
        background: '#f5f5f5', 
        padding: '24px',
        borderRadius: '12px',
        margin: '20px 0',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '300px' 
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                border: '4px solid #e5e7eb',
                borderTop: '4px solid #2563eb',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}></div>
              <p style={{ color: '#4b5563', margin: 0 }}>Loading {selectedView} data...</p>
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
      <div style={{ 
        minHeight: '400px', 
        background: '#f5f5f5', 
        padding: '24px',
        borderRadius: '12px',
        margin: '20px 0',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #ef4444',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center'
          }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              color: '#dc2626', 
              margin: '0 0 8px 0' 
            }}>Error Loading Data</h2>
            <p style={{ color: '#4b5563', margin: '0 0 16px 0' }}>{error}</p>
            <button
                onClick={() => {
                setError(null);
                setLoading(true);
                Promise.all([fetchHoldings(), fetchPositions(), fetchDailyPL()]).finally(() => setLoading(false));
              }}
              style={{
                background: '#dc2626',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = '#b91c1c'}
              onMouseOut={(e) => e.target.style.background = '#dc2626'}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '400px', 
      background: '#f5f5f5', 
      padding: '24px',
      borderRadius: '12px',
      margin: '20px 0',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          marginBottom: '32px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: 'bold', 
              color: 'black', 
              margin: '0 0 8px 0' 
            }}>Trading Dashboard</h1>
            <p style={{ color: '#4b5563', margin: 0 }}>Real-time portfolio performance</p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <select
              value={selectedView}
              onChange={(e) => setSelectedView(e.target.value)}
              style={{
                background: '#fff',
                color: 'black',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px'
              }}
            >
              <option value="Holdings">Holdings ({holdingsData.length})</option>
              <option value="Positions">Positions ({positionsData.length})</option>
            </select>

            {/* chart metric selector removed - plotting Daily P&L by default */}
          </div>
        </div>

        {/* Summary Cards */}
        {(currentData.length > 0 || dailyPLHistory.length > 0) && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '24px', 
            marginBottom: '32px' 
          }}>
            {/* Total Investment */}
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between' 
              }}>
                <div>
                  <p style={{ color: '#4b5563', fontSize: '14px', margin: '0 0 8px 0' }}>Total Investment</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'black', margin: 0 }}>
                    ${currentTotalInvested.toLocaleString()}
                  </p>
                </div>
                <DollarSign style={{ width: '32px', height: '32px', color: '#2563eb' }} />
              </div>
            </div>

            {/* Current Value */}
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between' 
              }}>
                <div>
                  <p style={{ color: '#4b5563', fontSize: '14px', margin: '0 0 8px 0' }}>Current Value</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'black', margin: 0 }}>
                    ${currentTotalValue.toLocaleString()}
                  </p>
                </div>
                <Activity style={{ width: '32px', height: '32px', color: '#059669' }} />
              </div>
            </div>

            {/* Total P&L */}
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between' 
              }}>
                <div>
                  <p style={{ color: '#4b5563', fontSize: '14px', margin: '0 0 8px 0' }}>Total P&L</p>
                  <p style={{ 
                    fontSize: '24px', 
                    fontWeight: 'bold', 
                    color: isProfit ? '#059669' : '#dc2626', 
                    margin: 0 
                  }}>
                    {isProfit ? '+' : ''}${(displayedTotalPL || 0).toLocaleString()}
                  </p>
                  <p style={{ 
                    fontSize: '14px', 
                    color: isProfit ? '#059669' : '#dc2626', 
                    margin: '4px 0 0 0' 
                  }}>
                    {currentTotalInvested > 0 ? `${isProfit ? '+' : ''}${currentTotalPLPercent.toFixed(2)}%` : ''}
                  </p>
                </div>
                {isProfit ? (
                  <TrendingUp style={{ width: '32px', height: '32px', color: '#059669' }} />
                ) : (
                  <TrendingDown style={{ width: '32px', height: '32px', color: '#dc2626' }} />
                )}
              </div>
            </div>

            {/* Today's P&L */}
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between' 
              }}>
                <div>
                  <p style={{ color: '#4b5563', fontSize: '14px', margin: '0 0 8px 0' }}>Today's P&L</p>
                  <p style={{ 
                    fontSize: '24px', 
                    fontWeight: 'bold', 
                    color: isTodayProfit ? '#059669' : '#dc2626', 
                    margin: 0 
                  }}>
                    {isTodayProfit ? '+' : ''}${Number(todayDelta).toLocaleString()}
                  </p>
                </div>
                {isTodayProfit ? (
                  <TrendingUp style={{ width: '32px', height: '32px', color: '#059669' }} />
                ) : (
                  <TrendingDown style={{ width: '32px', height: '32px', color: '#dc2626' }} />
                )}
              </div>
            </div>
          </div>
        )}

        {/* No Data Message */}
        {(currentData.length === 0 && dailyPLHistory.length === 0) && (
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              color: 'black', 
              margin: '0 0 8px 0' 
            }}>No {selectedView} Found</h2>
            <p style={{ color: '#4b5563', margin: 0 }}>
              You don't have any {selectedView.toLowerCase()} at the moment.
            </p>
          </div>
        )}

        {/* Daily P&L Chart */}
        {chartData.length > 0 && (
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #e5e7eb'
          }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              color: 'black', 
              margin: '0 0 24px 0' 
            }}>{selectedView} Daywise P&L</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#4b5563" style={{ fontSize: '12px' }} />
              <YAxis stroke="#4b5563" style={{ fontSize: '12px' }} />
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
        )}
      </div>
    </div>
  );
};

export default ProfitAndLossGraph;
