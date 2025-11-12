import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const IncomeReport = ({ symbol = "AAPL" }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format numbers like trillions, billions, millions
  const formatValue = (value) => {
    if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    return value;
  };

  // Custom tooltip for hover info
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">Fiscal Year: {label}</p>
          <p className="tooltip-value">
            Net Profit: ${formatValue(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:8000/api/financial/income-reported/${symbol}`
        );
        const responseData = await response.json();

        if (!response.ok || !responseData.success) {
          throw new Error(responseData.error || "Failed to fetch income report data");
        }

        const result = processData(responseData.data);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol]);

  // Process backend data for chart
  const processData = (rawData) => {
    return rawData
      .sort((a, b) => parseInt(a.fiscalYear) - parseInt(b.fiscalYear))
      .map((item) => ({
        year: item.fiscalYear,
        netProfit: item.netProfit,
      }));
  };

  // Calculate growth over years
  const calculateGrowth = () => {
    if (data.length < 2) return null;
    const oldest = data[0].netProfit;
    const newest = data[data.length - 1].netProfit;
    const growth = ((newest - oldest) / oldest) * 100;
    return growth.toFixed(1);
  };

  const growth = calculateGrowth();

  // Loading state
  if (loading)
    return (
      <div className="chart-card loading-state">
        <div className="loading-spinner" />
        <p>Loading income report...</p>
      </div>
    );

  // Error state
  if (error)
    return (
      <div className="chart-card error-state">
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );

  return (
    <div className="chart-card">
      <h2 className="chart-title">
        {symbol} — Net Profit (As Reported)
      </h2>

      {data.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={380}>
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              barSize={50}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis
                dataKey="year"
                tick={{ fill: "#ddd", fontSize: 12 }}
                label={{
                  value: "Fiscal Year",
                  position: "bottom",
                  offset: 20,
                  fill: "#aaa",
                }}
              />
              <YAxis
                tickFormatter={formatValue}
                tick={{ fill: "#ddd", fontSize: 12 }}
                label={{
                  value: "Net Profit (USD)",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#aaa",
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="netProfit"
                radius={[8, 8, 0, 0]}
                animationDuration={1200}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#3b82f6" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="stats-grid">
            <div className="stat-box">
              <p>Total Years</p>
              <h3>{data.length}</h3>
            </div>
            <div className="stat-box">
              <p>Latest Year</p>
              <h3>{data[data.length - 1].year}</h3>
            </div>
            <div className="stat-box">
              <p>Latest Net Profit</p>
              <h3>${formatValue(data[data.length - 1].netProfit)}</h3>
            </div>
            <div className="stat-box">
              <p>Change (%)</p>
              <h3 className={growth >= 0 ? "positive" : "negative"}>
                {growth ? `${growth}%` : "N/A"}
              </h3>
            </div>
          </div>
        </>
      ) : (
        <p>No data available for this symbol.</p>
      )}

      <style>{`
        .chart-card {
          background: linear-gradient(145deg, #0f172a, #1e293b);
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
          color: #fff;
          font-family: "Inter", sans-serif;
          transition: all 0.3s ease;
        }
        .chart-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
        }
        .chart-title {
          text-align: center;
          font-size: 22px;
          font-weight: 600;
          color: #3b82f6;
          margin-bottom: 18px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 16px;
          margin-top: 24px;
        }
        .stat-box {
          background: rgba(255, 255, 255, 0.08);
          padding: 12px;
          border-radius: 12px;
          text-align: center;
          transition: all 0.3s ease;
        }
        .stat-box:hover {
          background: rgba(255, 255, 255, 0.12);
        }
        .positive {
          color: #22c55e;
        }
        .negative {
          color: #ef4444;
        }
        .loading-state, .error-state {
          background: #1e293b;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          color: #ddd;
        }
        .loading-spinner {
          border: 3px solid #3b82f6;
          border-top: 3px solid transparent;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          margin: 0 auto 10px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        .custom-tooltip {
          background: #1e293b;
          color: #fff;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 13px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
};

export default IncomeReport;
