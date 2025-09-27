import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";



export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [filter, setFilter] = useState('all');
  // const [sortBy, setSortBy] = useState('date');
  // const [sortOrder, setSortOrder] = useState('desc');


  const {getToken} = useAuth();

  

  // Simulate API call
  const fetchOrderData = async () => {

    const authToken = await getToken();
    console.log(authToken);
    try {
      setLoading(true);
      const data = await axios.post(
      "http://localhost:8000/api/order/find",
      {},
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        }
      }
    );
    setOrders(data.data)
     console.log(data);

      
      // setOrders(mockApiData);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderData();
  }, []);

  // const totalPortfolioValue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  // const totalQuantity = orders.reduce((sum, order) => sum + order.quantity, 0);
  // const executedOrders = orders.filter(order => order.status === 'Executed').length;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // const getStatusColor = (status) => {
  //   switch (status) {
  //     case 'Executed': return '#00C851';
  //     case 'Pending': return '#ffbb33';
  //     case 'Cancelled': return '#ff4444';
  //     default: return '#666';
  //   }
  // };

  const getModeColor = (mode) => {
    switch (mode) {
      case 'Market': return '#007bff';
      case 'Limit': return '#28a745';
      case 'Stop Loss': return '#dc3545';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <div style={styles.loadingText}>Loading your portfolio...</div>
        </div>
      </div>
    );
  }

  return (

    
    orders.length === 0 ? (
      <div className="orders">
      <div className="no-orders">
        <p>You haven't placed any orders today</p>
        <Link to={"/"} className="btn">
          Get started
        </Link>
      </div>
    </div>
    ) : (
       <div style={styles.container}>
     
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Portfolio Orders</h1>
          <p style={styles.subtitle}>Track and manage your stock orders</p>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.refreshButton} onClick={fetchOrderData}>
            ↻ Refresh
          </button>
        </div>
      </div>

   

      
      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <h2 style={styles.tableTitle}>Recent Orders</h2>
        </div>
        
        <div style={styles.table}>
         
          <div style={styles.tableHeaderRow}>
            <div style={{...styles.headerCell, ...styles.stockColumn}}>Stock</div>
            <div style={{...styles.headerCell, ...styles.quantityColumn}}>Quantity</div>
            <div style={{...styles.headerCell, ...styles.dateColumn}}>Date</div>
            <div style={{...styles.headerCell, ...styles.modeColumn}}>Order Type</div>
            <div style={{...styles.headerCell, ...styles.priceColumn}}>Price</div>
            <div style={{...styles.headerCell, ...styles.totalColumn}}>Total Value</div>
            
          </div>

       
          {orders.map((order, index) => (
            <div key={order.id} style={{...styles.tableRow, backgroundColor: index % 2 === 0 ? '#fafafa' : 'white'}}>
              <div style={{...styles.cell, ...styles.stockColumn}}>
                <div style={styles.stockInfo}>
                  <div style={styles.stockName}>{order.symbol}</div>
                </div>
              </div>
              <div style={{...styles.cell, ...styles.quantityColumn}}>
                <span style={styles.quantity}>{order.quantity.toLocaleString()}</span>
              </div>
              <div style={{...styles.cell, ...styles.dateColumn}}>
                <span style={styles.date}>{formatDate(order.placedAt)}</span>
              </div>
              <div style={{...styles.cell, ...styles.modeColumn}}>
                <span style={{...styles.modeBadge, backgroundColor: getModeColor(order.mode) + '15', color: getModeColor(order.mode)}}>
                  {order.mode}
                </span>
              </div>
              <div style={{...styles.cell, ...styles.priceColumn}}>
                <span style={styles.price}>{formatCurrency(order.purchasePrice)}</span>
              </div>
              <div style={{...styles.cell, ...styles.totalColumn}}>
                <span style={styles.total}>{formatCurrency(order.totalAmount)}</span>
              </div>
              
            </div>
          ))}
          
        </div>
      </div>
    </div>
    )
      

    
  
   
  );
}

const styles = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
    padding: '24px',
    color: '#212529'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px'
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    margin: '0 0 8px 0',
    color: '#212529'
  },
  subtitle: {
    fontSize: '16px',
    color: '#6c757d',
    margin: 0
  },
  headerActions: {
    display: 'flex',
    gap: '12px'
  },
  refreshButton: {
    padding: '10px 20px',
    backgroundColor: 'white',
    color: '#495057',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'all 0.2s ease'
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    marginBottom: '40px'
  },
  statCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#212529',
    marginBottom: '8px'
  },
  statLabel: {
    fontSize: '14px',
    color: '#6c757d',
    marginBottom: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  statChange: {
    fontSize: '14px',
    color: '#28a745',
    fontWeight: '500'
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  },
  tableHeader: {
    padding: '24px 24px 0 24px'
  },
  tableTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#212529',
    margin: '0 0 24px 0'
  },
  table: {
    width: '100%'
  },
  tableHeaderRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1.5fr',
    padding: '16px 24px',
    backgroundColor: '#f8f9fa'
  },
  headerCell: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#495057',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1.5fr',
    padding: '20px 24px',
    alignItems: 'center',
    transition: 'background-color 0.2s ease'
  },
  cell: {
    fontSize: '14px',
    color: '#212529'
  },
  stockColumn: { justifySelf: 'start' },
  quantityColumn: { justifySelf: 'center' },
  dateColumn: { justifySelf: 'center' },
  modeColumn: { justifySelf: 'center' },
  priceColumn: { justifySelf: 'end' },
  totalColumn: { justifySelf: 'end' },
  stockInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  stockName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#212529',
    marginBottom: '2px'
  },
  ticker: {
    fontSize: '12px',
    color: '#6c757d',
    fontWeight: '500'
  },
  quantity: {
    fontSize: '14px',
    fontWeight: '500'
  },
  date: {
    fontSize: '14px',
    color: '#495057'
  },
  modeBadge: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500'
  },
  price: {
    fontSize: '14px',
    fontWeight: '500'
  },
  total: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#212529'
  },
  statusBadge: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500'
  },
  growth: {
    fontSize: '14px',
    fontWeight: '600'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px'
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #007bff',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px'
  },
  loadingText: {
    fontSize: '16px',
    color: '#6c757d'
  }
};

// Add CSS animation for loading spinner
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .table-row:hover {
      background-color: #f1f3f4 !important;
    }
  `;
  document.head.appendChild(style);
}




