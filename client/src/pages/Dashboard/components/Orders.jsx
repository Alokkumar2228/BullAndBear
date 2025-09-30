import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";



export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const {getToken} = useAuth();

  const fetchOrderData = React.useCallback(async () => {
    setError(null);
    const authToken = await getToken();
    
    try {
      setLoading(true);
      
      // Fetch all orders first
      const response = await axios.post(
        "http://localhost:8000/api/order/find",
        {},
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          }
        }
      );

      // Filter orders on client side based on selected filter

      
      console.log('Current filter:', filter);
      console.log('All orders:', response.data);
      
      // Single state update with filtered results
      if (filter !== 'all' && response.data) {
        const filteredOrders = response.data.filter(order => {
          console.log('Checking order:', order);
          return order.orderType === filter;
        });
        console.log('Filtered orders:', filteredOrders);
        setOrders(filteredOrders);
      } else {
        console.log('Setting all orders');
        setOrders(response.data || []);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch orders';
      setError(errorMessage);
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, [filter, getToken]);

  useEffect(() => {
    fetchOrderData();
  }, [fetchOrderData]); // Adding filter as dependency since we want to refetch when filter changes

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'EXECUTED': return '#28a745';
      case 'PENDING': return '#ffc107';
      case 'CANCELLED': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getOrderTypeColor = (orderType) => {
    switch (orderType) {
      case 'INTRADAY': return '#e91e63';
      case 'DELIVERY': return '#2196f3';
      case 'FNO': return '#ff9800';
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
       <div style={styles.container}>
      {error && (
        <div style={styles.errorMessage}>
          {error}
          <button 
            onClick={() => {
              setError(null);
              fetchOrderData();
            }}
            style={{ marginLeft: '10px', textDecoration: 'underline' }}
          >
            Try Again
          </button>
        </div>
      )}
     
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Portfolio Orders</h1>
          <p style={styles.subtitle}>Track and manage your stock orders</p>
        </div>
        <div style={styles.headerActions}>
          <select 
            style={styles.filterSelect} 
            value={filter} 
            onChange={(e) => {
              console.log('Filter changed to:', e.target.value);
              setFilter(e.target.value);
            }}
          >
            <option value="all">All Orders</option>
            <option value="INTRADAY">Intraday</option>
            <option value="DELIVERY">Delivery</option>
            <option value="FNO">F&O</option>
          </select>
          <button style={styles.refreshButton} onClick={fetchOrderData}>
            ↻ Refresh
          </button>
        </div>
      </div>

   

      
      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <h2 style={styles.tableTitle}>Recent Orders</h2>
        </div>
        
        {orders.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#6c757d' }}>
            <div style={{ fontSize: '16px', marginBottom: '12px' }}>
              {filter !== 'all' ? 'No orders match this filter.' : "You haven't placed any orders yet."}
            </div>
            {filter !== 'all' ? (
              <button
                style={styles.refreshButton}
                onClick={() => setFilter('all')}
              >
                Clear filter
              </button>
            ) : (
              <Link to={"/"} className="btn">Get started</Link>
            )}
          </div>
        ) : (
          <div style={styles.table}>
            <div style={styles.tableHeaderRow}>
              <div style={{...styles.headerCell, ...styles.stockColumn}}>Stock</div>
              <div style={{...styles.headerCell, ...styles.quantityColumn}}>Quantity</div>
              <div style={{...styles.headerCell, ...styles.dateColumn}}>Date</div>
              <div style={{...styles.headerCell, ...styles.orderTypeColumn}}>Order Type</div>
              <div style={{...styles.headerCell, ...styles.priceColumn}}>Price</div>
              <div style={{...styles.headerCell, ...styles.totalColumn}}>Total Value</div>
              <div style={{...styles.headerCell, ...styles.statusColumn}}>Status</div>
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
                <div style={{...styles.cell, ...styles.orderTypeColumn}}>
                  <span style={{...styles.orderTypeBadge, backgroundColor: getOrderTypeColor(order.orderType) + '15', color: getOrderTypeColor(order.orderType)}}>
                    {order.orderType || 'DELIVERY'}
                  </span>
                </div>
                <div style={{...styles.cell, ...styles.priceColumn}}>
                  <span style={styles.price}>{formatCurrency(order.purchasePrice)}</span>
                </div>
                <div style={{...styles.cell, ...styles.totalColumn}}>
                  <span style={styles.total}>{formatCurrency(order.totalAmount)}</span>
                </div>
                <div style={{...styles.cell, ...styles.statusColumn}}>
                  <span style={{...styles.statusBadge, backgroundColor: getStatusColor(order.status) + '15', color: getStatusColor(order.status)}}>
                    {order.status || 'EXECUTED'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
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
  filterSelect: {
    padding: '10px 20px',
    backgroundColor: 'white',
    color: '#495057',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    borderRadius: '8px',
    border: '1px solid #dee2e6',
    outline: 'none',
    marginRight: '10px'
  },
  errorMessage: {
    color: '#dc3545',
    backgroundColor: '#f8d7da',
    padding: '12px 20px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
    textAlign: 'center'
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
    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1.5fr 1fr',
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
    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1.5fr 1fr',
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
  orderTypeColumn: { justifySelf: 'center' },
  priceColumn: { justifySelf: 'end' },
  totalColumn: { justifySelf: 'end' },
  statusColumn: { justifySelf: 'center' },
  orderTypeBadge: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500'
  },
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




