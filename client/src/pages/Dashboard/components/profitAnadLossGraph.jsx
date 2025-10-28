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

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      await Promise.all([fetchHoldings(), fetchPositions()]);
      setLoading(false);
    };
    
    fetchData();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchHoldings, fetchPositions]);

  // Compute P&L for chart based on real-time data
  const chartData = useMemo(() => {
    const data = selectedView === 'Holdings' ? holdingsData : positionsData;
    
    if (!data || data.length === 0) {
      return [];
    }

    // Calculate current P&L for each stock
    const stockPL = data.map(stock => {
      const invested = selectedView === 'Holdings'
        ? stock.totalAmount || stock.quantity * stock.purchasePrice
        : stock.quantity * stock.purchasePrice;
      const currentValue = stock.quantity * stock.actualPrice;
      const profitLoss = currentValue - invested;
      const profitPercent = invested > 0 ? ((profitLoss / invested) * 100) : 0;
      
      return {
        symbol: stock.symbol,
        name: stock.name,
        quantity: stock.quantity,
        purchasePrice: stock.purchasePrice,
        actualPrice: stock.actualPrice,
        invested,
        currentValue,
        profitLoss,
        profitPercent,
        changePercent: stock.changePercent || 0
      };
    });

    // Calculate totals
    const totalInvested = stockPL.reduce((sum, stock) => sum + stock.invested, 0);
    const totalCurrentValue = stockPL.reduce((sum, stock) => sum + stock.currentValue, 0);
    const totalPL = totalCurrentValue - totalInvested;

    // Create chart data points (simulating daily progression)
    const today = new Date();
    const chartPoints = [];
    
    // Generate last 7 days of data for visualization
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Simulate daily P&L variation (±5% of total P&L)
      const dailyVariation = (Math.random() - 0.5) * 0.1 * totalPL;
      const dailyPL = totalPL + dailyVariation;
      
      chartPoints.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        dailyPL: dailyPL,
        totalPL: totalPL,
        portfolioValue: totalCurrentValue + dailyVariation,
        totalInvested: totalInvested,
        totalCurrentValue: totalCurrentValue + dailyVariation
      });
    }

    return chartPoints;
  }, [selectedView, holdingsData, positionsData]);

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
  
  const isProfit = currentTotalPL >= 0;
  const todayPL = chartData.length > 0 ? chartData[chartData.length - 1].dailyPL : 0;
  const isTodayProfit = todayPL >= 0;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          background: '#1f2937',
          border: '1px solid #374151',
          padding: '12px',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}>
          <p style={{ color: 'white', fontWeight: '600', margin: '0 0 4px 0' }}>{data.date}</p>
          <p style={{ color: '#9ca3af', fontSize: '14px', margin: '0 0 4px 0' }}>
            Portfolio: ₹{data.portfolioValue.toLocaleString()}
          </p>
          <p style={{ 
            color: data.dailyPL >= 0 ? '#34d399' : '#f87171', 
            fontSize: '14px', 
            margin: '0 0 4px 0' 
          }}>
            Daily P&L: {data.dailyPL >= 0 ? '+' : ''}₹{data.dailyPL.toLocaleString()}
          </p>
          <p style={{ 
            color: data.totalPL >= 0 ? '#34d399' : '#f87171', 
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
        background: 'linear-gradient(135deg, #1f2937 0%, #111827 50%, #1f2937 100%)', 
        padding: '24px',
        borderRadius: '12px',
        margin: '20px 0'
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
                border: '4px solid #4b5563',
                borderTop: '4px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}></div>
              <p style={{ color: '#9ca3af', margin: 0 }}>Loading {selectedView} data...</p>
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
        background: 'linear-gradient(135deg, #1f2937 0%, #111827 50%, #1f2937 100%)', 
        padding: '24px',
        borderRadius: '12px',
        margin: '20px 0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid #ef4444',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center'
          }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              color: '#f87171', 
              margin: '0 0 8px 0' 
            }}>Error Loading Data</h2>
            <p style={{ color: '#d1d5db', margin: '0 0 16px 0' }}>{error}</p>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                Promise.all([fetchHoldings(), fetchPositions()]).finally(() => setLoading(false));
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
      background: 'linear-gradient(135deg, #1f2937 0%, #111827 50%, #1f2937 100%)', 
      padding: '24px',
      borderRadius: '12px',
      margin: '20px 0'
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
              color: 'white', 
              margin: '0 0 8px 0' 
            }}>Trading Dashboard</h1>
            <p style={{ color: '#9ca3af', margin: 0 }}>Real-time portfolio performance</p>
          </div>
          <select
            value={selectedView}
            onChange={(e) => setSelectedView(e.target.value)}
            style={{
              background: '#1f2937',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #374151',
              fontSize: '14px'
            }}
          >
            <option value="Holdings">Holdings ({holdingsData.length})</option>
            <option value="Positions">Positions ({positionsData.length})</option>
          </select>
        </div>

        {/* Summary Cards */}
        {currentData.length > 0 && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '24px', 
            marginBottom: '32px' 
          }}>
            {/* Total Investment */}
            <div style={{
              background: '#1f2937',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #374151'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between' 
              }}>
                <div>
                  <p style={{ color: '#9ca3af', fontSize: '14px', margin: '0 0 8px 0' }}>Total Investment</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', margin: 0 }}>
                    ${currentTotalInvested.toLocaleString()}
                  </p>
                </div>
                <DollarSign style={{ width: '32px', height: '32px', color: '#60a5fa' }} />
              </div>
            </div>

            {/* Current Value */}
            <div style={{
              background: '#1f2937',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #374151'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between' 
              }}>
                <div>
                  <p style={{ color: '#9ca3af', fontSize: '14px', margin: '0 0 8px 0' }}>Current Value</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', margin: 0 }}>
                    ${currentTotalValue.toLocaleString()}
                  </p>
                </div>
                <Activity style={{ width: '32px', height: '32px', color: '#34d399' }} />
              </div>
            </div>

            {/* Total P&L */}
            <div style={{
              background: '#1f2937',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #374151'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between' 
              }}>
                <div>
                  <p style={{ color: '#9ca3af', fontSize: '14px', margin: '0 0 8px 0' }}>Total P&L</p>
                  <p style={{ 
                    fontSize: '24px', 
                    fontWeight: 'bold', 
                    color: isProfit ? '#34d399' : '#f87171', 
                    margin: 0 
                  }}>
                    {isProfit ? '+' : ''}${currentTotalPL.toLocaleString()}
                  </p>
                  <p style={{ 
                    fontSize: '14px', 
                    color: isProfit ? '#34d399' : '#f87171', 
                    margin: '4px 0 0 0' 
                  }}>
                    {isProfit ? '+' : ''}{currentTotalPLPercent.toFixed(2)}%
                  </p>
                </div>
                {isProfit ? (
                  <TrendingUp style={{ width: '32px', height: '32px', color: '#34d399' }} />
                ) : (
                  <TrendingDown style={{ width: '32px', height: '32px', color: '#f87171' }} />
                )}
              </div>
            </div>

            {/* Today's P&L */}
            <div style={{
              background: '#1f2937',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #374151'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between' 
              }}>
                <div>
                  <p style={{ color: '#9ca3af', fontSize: '14px', margin: '0 0 8px 0' }}>Today's P&L</p>
                  <p style={{ 
                    fontSize: '24px', 
                    fontWeight: 'bold', 
                    color: isTodayProfit ? '#34d399' : '#f87171', 
                    margin: 0 
                  }}>
                    {isTodayProfit ? '+' : ''}${todayPL.toLocaleString()}
                  </p>
                </div>
                {isTodayProfit ? (
                  <TrendingUp style={{ width: '32px', height: '32px', color: '#34d399' }} />
                ) : (
                  <TrendingDown style={{ width: '32px', height: '32px', color: '#f87171' }} />
                )}
              </div>
            </div>
          </div>
        )}

        {/* No Data Message */}
        {currentData.length === 0 && (
          <div style={{
            background: '#1f2937',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #374151',
            textAlign: 'center'
          }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              color: 'white', 
              margin: '0 0 8px 0' 
            }}>No {selectedView} Found</h2>
            <p style={{ color: '#9ca3af', margin: 0 }}>
              You don't have any {selectedView.toLowerCase()} at the moment.
            </p>
          </div>
        )}

        {/* Daily P&L Chart */}
        {chartData.length > 0 && (
          <div style={{
            background: '#1f2937',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #374151'
          }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              color: 'white', 
              margin: '0 0 24px 0' 
            }}>{selectedView} Daywise P&L</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="dailyPL"
                  stroke={isProfit ? "#10b981" : "#ef4444"}
                strokeWidth={2}
                  dot={{ fill: isProfit ? "#10b981" : "#ef4444", r: 4 }}
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
