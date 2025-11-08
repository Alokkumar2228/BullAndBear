import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import axios from 'axios';

const TotalAssetsChart = ({ symbol = 'AAPL' }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Simulated API response - replace with your actual API call
        // const mockResponse = [
        //   { symbol: "AAPL", date: "2025-09-27", fiscalYear: "2025", currency: "USD", inventory: 6502000000, totalAssets: 73733000000, shareholdersEquity: 32160000000 },
        //   { symbol: "AAPL", date: "2024-09-28", fiscalYear: "2024", currency: "USD", inventory: 6808500000, totalAssets: 56950000000, shareholdersEquity: 22275000000 },
        //   { symbol: "AAPL", date: "2023-09-30", fiscalYear: "2023", currency: "USD", inventory: 5638500000, totalAssets: 62146000000, shareholdersEquity: 52634000000 },
        //   { symbol: "AAPL", date: "2022-09-24", fiscalYear: "2022", currency: "USD", inventory: 5763000000, totalAssets: 50672000000, shareholdersEquity: 33957000000 },
        //   { symbol: "AAPL", date: "2021-09-25", fiscalYear: "2021", currency: "USD", inventory: 5320500000, totalAssets: 63090000000, shareholdersEquity: 58882000000 }
        // ];
        

        const response = await axios.get(`http://localhost:8000/api/financial/balance-sheet/${symbol}`);
        if (!response.data.success) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = response.data.data;
        console.log('Fetched data:', result);
        
        // const result = mockResponse;
        
        // Process data for chart
        const chartData = processData(result);
        setData(chartData);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol]);

  const processData = (rawData) => {
    // Sort by fiscal year and map to chart format
    return rawData
      .sort((a, b) => parseInt(a.fiscalYear) - parseInt(b.fiscalYear))
      .map(item => ({
        year: item.fiscalYear,
        totalAssets: item.totalAssets,
        currency: item.currency
      }));
  };

  const formatAssets = (value) => {
    if (value >= 1e12) {
      return `$${(value / 1e12).toFixed(2)}T`;
    } else if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(2)}M`;
    }
    return `$${value.toLocaleString()}`;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-year">FY {payload[0].payload.year}</p>
          <p className="tooltip-value">
            Total Assets: {formatAssets(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const calculateGrowth = () => {
    if (data.length < 2) return null;
    const oldest = data[0].totalAssets;
    const newest = data[data.length - 1].totalAssets;
    const growth = ((newest - oldest) / oldest * 100).toFixed(1);
    return growth;
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <div className="spinner-container">
            <div className="spinner"></div>
            <p className="loading-text">Loading financial data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="card">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h3 className="error-title">Error Loading Data</h3>
            <p className="error-message">{error}</p>
            <button 
              className="retry-button"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const growth = calculateGrowth();

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <h2 className="title">{symbol} Total Assets</h2>
          <p className="subtitle">Annual total assets by fiscal year</p>
        </div>
        
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" opacity={0.3} />
              <XAxis 
                dataKey="year" 
                stroke="#666"
                tick={{ fill: '#ffffff', fontSize: 13, fontWeight: '500' }}
                angle={0}
                textAnchor="middle"
                height={60}
                label={{ value: 'Fiscal Year', position: 'insideBottom', offset: -10, fill: '#94a3b8' }}
              />
              <YAxis 
                stroke="#666"
                tick={{ fill: '#ffffff', fontSize: 12 }}
                tickFormatter={formatAssets}
                width={90}
                label={{ value: 'Total Assets (USD)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
              <Bar 
                dataKey="totalAssets" 
                fill="#3b82f6"
                radius={[8, 8, 0, 0]}
                animationDuration={1000}
                animationBegin={0}
                maxBarSize={60}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill="#3b82f6"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="stats-container">
          <div className="stat-card">
            <p className="stat-label">Total Years</p>
            <p className="stat-value">{data.length}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Latest Year</p>
            <p className="stat-value">FY {data[data.length - 1]?.year || 'N/A'}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Latest Assets</p>
            <p className="stat-value">{data[data.length - 1] ? formatAssets(data[data.length - 1].totalAssets) : 'N/A'}</p>
          </div>
          {growth && (
            <div className="stat-card">
              <p className="stat-label">Growth ({data[0]?.year} - {data[data.length - 1]?.year})</p>
              <p className="stat-value" style={{ color: parseFloat(growth) >= 0 ? '#22c55e' : '#ef4444' }}>
                {growth > 0 ? '+' : ''}{growth}%
              </p>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        .container {
          width: 100%;
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          padding: 20px;
          box-sizing: border-box;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        
        .card {
          max-width: 1200px;
          margin: 0 auto;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          min-height: 600px;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }
        
        .header {
          margin-bottom: 30px;
          border-bottom: 2px solid #3b82f6;
          padding-bottom: 20px;
        }
        
        .title {
          color: #ffffff;
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 8px 0;
          letter-spacing: -0.5px;
          text-shadow: 0 2px 10px rgba(59, 130, 246, 0.3);
        }
        
        .subtitle {
          color: #94a3b8;
          font-size: 15px;
          margin: 0;
          font-weight: 400;
        }
        
        .chart-container {
          width: 100%;
          height: 450px;
          background: rgba(15, 23, 42, 0.5);
          border-radius: 16px;
          padding: 30px;
          box-sizing: border-box;
          margin-bottom: 30px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .stats-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }
        
        .stat-card {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        
        .stat-label {
          color: #94a3b8;
          font-size: 12px;
          margin: 0 0 8px 0;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
        }
        
        .stat-value {
          color: #3b82f6;
          font-size: 22px;
          margin: 0;
          font-weight: 700;
        }
        
        .custom-tooltip {
          background: rgba(15, 23, 42, 0.98);
          border: 2px solid #3b82f6;
          border-radius: 12px;
          padding: 16px 20px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
        }
        
        .tooltip-year {
          color: #ffffff;
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 6px 0;
        }
        
        .tooltip-value {
          color: #3b82f6;
          font-size: 15px;
          font-weight: 600;
          margin: 0;
        }
        
        .spinner-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 500px;
        }
        
        .spinner {
          width: 60px;
          height: 60px;
          border: 5px solid rgba(59, 130, 246, 0.2);
          border-top: 5px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        .loading-text {
          color: #94a3b8;
          font-size: 16px;
          margin-top: 24px;
          font-weight: 500;
        }
        
        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 500px;
          text-align: center;
        }
        
        .error-icon {
          font-size: 56px;
          margin-bottom: 20px;
        }
        
        .error-title {
          color: #ffffff;
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 12px 0;
        }
        
        .error-message {
          color: #ff6b6b;
          font-size: 16px;
          margin: 0 0 28px 0;
          max-width: 400px;
        }
        
        .retry-button {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: #ffffff;
          border: none;
          border-radius: 10px;
          padding: 14px 32px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .retry-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(59, 130, 246, 0.6);
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .card {
            padding: 25px;
          }
          
          .title {
            font-size: 24px;
          }
          
          .chart-container {
            height: 350px;
            padding: 15px;
          }
          
          .stats-container {
            grid-template-columns: 1fr 1fr;
          }
        }
        
        @media (max-width: 480px) {
          .title {
            font-size: 20px;
          }
          
          .chart-container {
            height: 300px;
          }
          
          .stats-container {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default TotalAssetsChart;