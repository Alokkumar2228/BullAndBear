import React, { useContext } from "react";
import Menu from "@/pages/Dashboard/components/Menu";
import './dashboard.css';
import { ContextApi } from "@/context/ContextApi";

const TopBar = ({ user }) => {
  const { USMarketIndicesData } = useContext(ContextApi);

  // Check if data is loaded
  const isDataLoaded = USMarketIndicesData?.sp500 && 
                       USMarketIndicesData?.dowJones && 
                       USMarketIndicesData?.nasdaq;

  const styles = {
    topbarContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '4px 4px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
      height: '45px',
      boxSizing: 'border-box',
      overflow: 'hidden'
    },
    indicesContainer: {
      display: 'flex',
      gap: '6px',
      alignItems: 'center',
      flex: 1,
      overflow: 'hidden'
    },
    indexCard: {
      display: 'flex',
      flexDirection: 'column',
      padding: '3px 8px',
      borderRadius: '4px',
      backgroundColor: '#f9fafb',
      minWidth: '120px',
      border: '1px solid #e5e7eb',
      flex: 1,
      maxWidth: '180px'
    },
    index: {
      margin: '0 0 2px 0',
      fontWeight: '600',
      fontSize: '9px',
      color: '#374151',
      textTransform: 'uppercase',
      letterSpacing: '0.2px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      lineHeight: '1.2'
    },
    indexData: {
      display: 'flex',
      gap: '1px',
      alignItems: 'center',
      flexWrap: 'nowrap'
    },
    price: {
      margin: '0',
      fontWeight: '700',
      fontSize: '10px',
      color: '#111827',
      whiteSpace: 'nowrap',
      lineHeight: '1.2'
    },
    change: {
      margin: '0',
      fontWeight: '600',
      fontSize: '8px',
      whiteSpace: 'nowrap',
      lineHeight: '1.2'
    },
    indexPoints: {
      margin: '0',
      fontWeight: '600',
      fontSize: '8px',
      whiteSpace: 'nowrap',
      lineHeight: '1.2'
    },
    positive: {
      color: '#10b981'
    },
    negative: {
      color: '#ef4444'
    }
  };

  return (
    <div style={styles.topbarContainer} className="topbar-container">
      <div style={styles.indicesContainer} className="indices-container">
        {/* S&P 500 */}
        <div style={styles.indexCard} className="index-card">
          <p style={styles.index} className="index">
            {USMarketIndicesData?.sp500?.name || "S&P 500"}
          </p>
          <div style={styles.indexData} className="index-data">
            <p style={styles.price} className="price">
              {isDataLoaded ? USMarketIndicesData.sp500.price.toLocaleString() : "--"}
            </p>
            <p 
              style={{
                ...styles.change,
                ...(USMarketIndicesData?.sp500?.change >= 0 ? styles.positive : styles.negative)
              }} 
              className="change"
            >
              {isDataLoaded 
                ? (USMarketIndicesData.sp500.change >= 0 ? '+' : '') + USMarketIndicesData.sp500.change.toFixed(2) 
                : "--"}
            </p>
            <p 
              style={{
                ...styles.indexPoints,
                ...(USMarketIndicesData?.sp500?.changePercent >= 0 ? styles.positive : styles.negative)
              }} 
              className="index-points"
            >
              {isDataLoaded 
                ? (USMarketIndicesData.sp500.changePercent >= 0 ? '+' : '') +"("+ USMarketIndicesData.sp500.changePercent.toFixed(2)+")" + "%" 
                : "--"}
            </p>
          </div>
        </div>

        {/* Dow Jones */}
        <div style={styles.indexCard} className="index-card">
          <p style={styles.index} className="index">
            {USMarketIndicesData?.dowJones?.name || "Dow Jones"}
          </p>
          <div style={styles.indexData} className="index-data">
            <p style={styles.price} className="price">
              {isDataLoaded ? USMarketIndicesData.dowJones.price.toLocaleString() : "--"}
            </p>
            <p 
              style={{
                ...styles.change,
                ...(USMarketIndicesData?.dowJones?.change >= 0 ? styles.positive : styles.negative)
              }} 
              className="change"
            >
              {isDataLoaded 
                ? (USMarketIndicesData.dowJones.change >= 0 ? '+' : '') + USMarketIndicesData.dowJones.change.toFixed(2) 
                : "--"}
            </p>
            <p 
              style={{
                ...styles.indexPoints,
                ...(USMarketIndicesData?.dowJones?.changePercent >= 0 ? styles.positive : styles.negative)
              }} 
              className="index-points"
            >
              {isDataLoaded 
                ? (USMarketIndicesData.dowJones.changePercent >= 0 ? '+' : '') + "("+ USMarketIndicesData.sp500.changePercent.toFixed(2)+")" + "%" 
                : "--"}
            </p>
          </div>
        </div>

        {/* NASDAQ */}
        <div style={styles.indexCard} className="index-card">
          <p style={styles.index} className="index">
            {USMarketIndicesData?.nasdaq?.name || "NASDAQ"}
          </p>
          <div style={styles.indexData} className="index-data">
            <p style={styles.price} className="price">
              {isDataLoaded ? USMarketIndicesData.nasdaq.price.toLocaleString() : "--"}
            </p>
            <p 
              style={{
                ...styles.change,
                ...(USMarketIndicesData?.nasdaq?.change >= 0 ? styles.positive : styles.negative)
              }} 
              className="change"
            >
              {isDataLoaded 
                ? (USMarketIndicesData.nasdaq.change >= 0 ? '+' : '') + USMarketIndicesData.nasdaq.change.toFixed(2) 
                : "--"}
            </p>
            <p 
              style={{
                ...styles.indexPoints,
                ...(USMarketIndicesData?.nasdaq?.changePercent >= 0 ? styles.positive : styles.negative)
              }} 
              className="index-points"
            >
              {isDataLoaded 
                ? (USMarketIndicesData.nasdaq.changePercent >= 0 ? '+' : '') +"("+ USMarketIndicesData.sp500.changePercent.toFixed(2)+")" + "%" 
                : "--"}
            </p>
          </div>
        </div>
      </div>

      <Menu user={user} />
    </div>
  );
};

export default TopBar;