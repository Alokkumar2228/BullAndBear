import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const MarketCapChart = ({ symbol = 'AAPL' }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Simulated API response - replace with your actual API call
        const mockResponse = {
          success: true,
          data: [
            { symbol: "AAPL", date: "2025-10-31", marketCap: 4041625945000 },
            { symbol: "AAPL", date: "2025-10-30", marketCap: 4057022899999 },
            { symbol: "AAPL", date: "2025-08-05", marketCap: 3033349620000 },
            { symbol: "AAPL", date: "2024-12-15", marketCap: 3800000000000 },
            { symbol: "AAPL", date: "2024-06-20", marketCap: 3200000000000 },
            { symbol: "AAPL", date: "2023-11-10", marketCap: 2950000000000 },
            { symbol: "AAPL", date: "2023-03-15", marketCap: 2400000000000 },
            { symbol: "AAPL", date: "2022-09-20", marketCap: 2650000000000 },
            { symbol: "AAPL", date: "2022-01-10", marketCap: 3000000000000 },
            { symbol: "AAPL", date: "2021-08-15", marketCap: 2450000000000 },
            { symbol: "AAPL", date: "2021-03-20", marketCap: 2100000000000 },
            { symbol: "AAPL", date: "2020-10-05", marketCap: 2200000000000 },
            { symbol: "AAPL", date: "2020-05-12", marketCap: 1800000000000 }
          ]
        };
        
        
        
        const result = mockResponse.data;
        
        // Process data to group by year and get average market cap
        const yearlyData = processDataByYear(result);
        setData(yearlyData);
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

  const processDataByYear = (rawData) => {
    const yearMap = {};
    
    rawData.forEach(item => {
      const year = new Date(item.date).getFullYear();
      if (!yearMap[year]) {
        yearMap[year] = {
          total: 0,
          count: 0
        };
      }
      yearMap[year].total += item.marketCap;
      yearMap[year].count += 1;
    });

    // Convert to array and sort by year
    return Object.keys(yearMap)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(year => ({
        year: year,
        marketCap: yearMap[year].total / yearMap[year].count
      }));
  };

  const formatMarketCap = (value) => {
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
          <p className="tooltip-year">{payload[0].payload.year}</p>
          <p className="tooltip-value">
            Avg Market Cap: {formatMarketCap(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <div className="spinner-container">
            <div className="spinner"></div>
            <p className="loading-text">Loading market data...</p>
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

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <h2 className="title">{symbol} Market Capitalization</h2>
          <p className="subtitle">Average market cap by year ({data.length} years)</p>
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
              />
              <YAxis 
                stroke="#666"
                tick={{ fill: '#ffffff', fontSize: 12 }}
                tickFormatter={formatMarketCap}
                width={90}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(34, 197, 94, 0.1)' }} />
              <Bar 
                dataKey="marketCap" 
                fill="#22c55e"
                radius={[8, 8, 0, 0]}
                animationDuration={1000}
                animationBegin={0}
                maxBarSize={80}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill="#22c55e"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="stats-container">
          <div className="stat-card">
            <p className="stat-label">Years Tracked</p>
            <p className="stat-value">{data.length}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Latest Year</p>
            <p className="stat-value">{data[data.length - 1]?.year || 'N/A'}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Latest Avg Market Cap</p>
            <p className="stat-value">{data[data.length - 1] ? formatMarketCap(data[data.length - 1].marketCap) : 'N/A'}</p>
          </div>
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
          border: 1px solid rgba(34, 197, 94, 0.2);
        }
        
        .header {
          margin-bottom: 30px;
          border-bottom: 2px solid #22c55e;
          padding-bottom: 20px;
        }
        
        .title {
          color: #ffffff;
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 8px 0;
          letter-spacing: -0.5px;
          text-shadow: 0 2px 10px rgba(34, 197, 94, 0.3);
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
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }
        
        .stat-card {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
        }
        
        .stat-label {
          color: #94a3b8;
          font-size: 13px;
          margin: 0 0 8px 0;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
        }
        
        .stat-value {
          color: #22c55e;
          font-size: 24px;
          margin: 0;
          font-weight: 700;
        }
        
        .custom-tooltip {
          background: rgba(15, 23, 42, 0.98);
          border: 2px solid #22c55e;
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
          color: #22c55e;
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
          border: 5px solid rgba(34, 197, 94, 0.2);
          border-top: 5px solid #22c55e;
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
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          color: #ffffff;
          border: none;
          border-radius: 10px;
          padding: 14px 32px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(34, 197, 94, 0.4);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .retry-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(34, 197, 94, 0.6);
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
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 480px) {
          .title {
            font-size: 20px;
          }
          
          .chart-container {
            height: 300px;
          }
        }
      `}</style>
    </div>
  );
};

export default MarketCapChart;