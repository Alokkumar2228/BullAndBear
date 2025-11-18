import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const CashFlow = ({ symbol = 'AAPL' }) => {
  const BASE_URL = import.meta.env.VITE_BASE_URL
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCashFlow = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/api/financial/cash-flow/${symbol}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        if (!responseData.success) {
          throw new Error('API returned unsuccessful response');
        }

        const chartData = processData(responseData.data);
        setData(chartData);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCashFlow();
  }, [symbol]);

  const processData = (rawData) => {
    return rawData
      .sort((a, b) => parseInt(a.fiscalYear) - parseInt(b.fiscalYear))
      .map(item => ({
        year: item.fiscalYear,
        freeCashFlow: item.freeCashFlow,
        operatingCashFlow: item.operatingCashFlow,
        capitalExpenditure: item.capitalExpenditure
      }));
  };

  const formatValue = (value) => {
    if (!value && value !== 0) return 'N/A';
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-year">FY {dataPoint.year}</p>
          <p className="tooltip-value">
            Free Cash Flow: {formatValue(dataPoint.freeCashFlow)}
          </p>
          <p className="tooltip-sub">Operating CF: {formatValue(dataPoint.operatingCashFlow)}</p>
          <p className="tooltip-sub">CapEx: {formatValue(dataPoint.capitalExpenditure)}</p>
        </div>
      );
    }
    return null;
  };

  const calculateGrowth = () => {
    if (data.length < 2) return null;
    const oldest = data[0].freeCashFlow;
    const newest = data[data.length - 1].freeCashFlow;
    if (!oldest || oldest === 0) return null;
    const growth = ((newest - oldest) / oldest * 100).toFixed(1);
    return growth;
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <div className="spinner-container">
            <div className="spinner"></div>
            <p className="loading-text">Loading cash flow data...</p>
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
          <h2 className="title">{symbol} Free Cash Flow</h2>
          <p className="subtitle">Annual Free Cash Flow by Fiscal Year</p>
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
                tickFormatter={formatValue}
                width={90}
                label={{ value: 'Free Cash Flow (USD)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }} />
              <Bar
                dataKey="freeCashFlow"
                fill="#10b981"
                radius={[8, 8, 0, 0]}
                animationDuration={1000}
                maxBarSize={60}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#10b981" />
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
            <p className="stat-label">Latest Free Cash Flow</p>
            <p className="stat-value">{data[data.length - 1] ? formatValue(data[data.length - 1].freeCashFlow) : 'N/A'}</p>
          </div>
          {growth && (
            <div className="stat-card">
              <p className="stat-label">Change ({data[0]?.year} - {data[data.length - 1]?.year})</p>
              <p className="stat-value" style={{ color: parseFloat(growth) >= 0 ? '#10b981' : '#ef4444' }}>
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
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .header {
          margin-bottom: 30px;
          border-bottom: 2px solid #10b981;
          padding-bottom: 20px;
        }

        .title {
          color: #ffffff;
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 8px 0;
          text-shadow: 0 2px 10px rgba(16, 185, 129, 0.3);
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
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
        }

        .stat-label {
          color: #94a3b8;
          font-size: 12px;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
        }

        .stat-value {
          color: #10b981;
          font-size: 22px;
          font-weight: 700;
        }

        .custom-tooltip {
          background: rgba(15, 23, 42, 0.98);
          border: 2px solid #10b981;
          border-radius: 12px;
          padding: 16px 20px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
        }

        .tooltip-year {
          color: #ffffff;
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 6px;
        }

        .tooltip-value {
          color: #10b981;
          font-size: 15px;
          font-weight: 600;
        }

        .tooltip-sub {
          color: #94a3b8;
          font-size: 13px;
          margin-top: 2px;
        }

        .spinner-container, .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 500px;
          text-align: center;
        }

        .spinner {
          width: 60px;
          height: 60px;
          border: 5px solid rgba(16, 185, 129, 0.2);
          border-top: 5px solid #10b981;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .loading-text {
          color: #94a3b8;
          font-size: 16px;
          margin-top: 24px;
          font-weight: 500;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .card { padding: 25px; }
          .title { font-size: 24px; }
          .chart-container { height: 350px; padding: 15px; }
          .stats-container { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 480px) {
          .title { font-size: 20px; }
          .chart-container { height: 300px; }
          .stats-container { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default CashFlow;
