import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { GeneralContext } from "@/pages/Dashboard/components/GeneralContext";

export default function Orders() {
  const {
    orders,
    ordersLoading,
    ordersError,
    getAllUserOrders,
  } = useContext(GeneralContext);

  const [filter, setFilter] = useState("all");

  // Fetch orders from context when component loads
  useEffect(() => {
    getAllUserOrders();
  }, [getAllUserOrders]);

  // ⭐ Filter only on UI
  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((order) => order.orderType === filter);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getOrderTypeColor = (orderType) => {
    switch (orderType) {
      case "INTRADAY":
        return "#e91e63";
      case "DELIVERY":
        return "#2196f3";
      case "FNO":
        return "#ff9800";
      default:
        return "#6c757d";
    }
  };

  const getModeColor = (mode) => (mode === "BUY" ? "#28a745" : "#dc3545");

  // ------------------ UI STATES ------------------

  if (ordersLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <div style={styles.loadingText}>Loading your orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {ordersError && (
        <div style={styles.errorMessage}>
          {ordersError}
          <button
            onClick={getAllUserOrders}
            style={styles.errorButton}
          >
            Try Again
          </button>
        </div>
      )}

      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Orders</h1>
          <p style={styles.subtitle}>Track and manage your stock orders</p>
        </div>

        <div style={styles.headerActions}>
          <select
            style={styles.filterSelect}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Orders</option>
            <option value="INTRADAY">Intraday</option>
            <option value="DELIVERY">Delivery</option>
            <option value="FNO">F&O</option>
          </select>

          <button
            style={styles.refreshButton}
            onClick={getAllUserOrders}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* ORDER LIST */}
      <div style={styles.ordersBox}>
        {filteredOrders.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyText}>
              {filter !== "all"
                ? "No orders match this filter."
                : "You haven't placed any orders yet."}
            </div>

            {filter !== "all" ? (
              <button
                style={styles.clearButton}
                onClick={() => setFilter("all")}
              >
                Clear filter
              </button>
            ) : (
              <Link to={"/"} style={styles.getStartedButton}>
                Get started
              </Link>
            )}
          </div>
        ) : (
          <div style={styles.ordersList}>
            {filteredOrders.map((order) => (
              <div key={order.id} style={styles.orderCard}>
                <div style={styles.orderHeader}>
                  <div style={styles.orderHeaderLeft}>
                    <h3 style={styles.stockSymbol}>{order.symbol}</h3>
                    <span style={styles.stockName}>{order.name}</span>
                  </div>

                  <div style={styles.orderHeaderRight}>
                    <span
                      style={{
                        ...styles.modeBadge,
                        color: getModeColor(order.mode),
                      }}
                    >
                      {order.mode}
                    </span>
                  </div>
                </div>

                <div style={styles.orderDetails}>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Type:</span>
                    <span
                      style={{
                        ...styles.orderTypeBadge,
                        color: getOrderTypeColor(order.orderType),
                      }}
                    >
                      {order.orderType}
                    </span>
                  </div>

                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Quantity:</span>
                    <span style={styles.detailValue}>
                      {order.quantity.toLocaleString()}
                    </span>
                  </div>

                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Date:</span>
                    <span style={styles.detailValue}>
                      {formatDate(order.executedAt)}
                    </span>
                  </div>

                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Purchase Price:</span>
                    <span style={styles.detailValue}>
                      {formatCurrency(order.purchasePrice)}
                    </span>
                  </div>

                  {order.mode === "SELL" &&
                    order.sellPrice !== null &&
                    order.sellPrice !== undefined && (
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Sell Price:</span>
                        <span style={styles.detailValue}>
                          {formatCurrency(order.sellPrice)}
                        </span>
                      </div>
                    )}
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
    backgroundColor: '#ffffff',
    minHeight: '100vh',
    padding: '24px',
    color: '#000000'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
    paddingBottom: '16px',
    borderBottom: '1px solid #e0e0e0',
    flexWrap: 'wrap',
    gap: '16px'
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    margin: '0 0 8px 0',
    color: '#000000'
  },
  subtitle: {
    fontSize: '16px',
    color: '#666666',
    margin: 0
  },
  headerActions: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  refreshButton: {
    padding: '10px 20px',
    backgroundColor: '#000000',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    borderRadius: '6px',
    border: 'none',
    transition: 'all 0.2s ease'
  },
  filterSelect: {
    padding: '10px 20px',
    backgroundColor: '#ffffff',
    color: '#000000',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    borderRadius: '6px',
    border: '1px solid #000000',
    outline: 'none'
  },
  errorMessage: {
    color: '#dc3545',
    backgroundColor: '#ffe6e6',
    padding: '12px 20px',
    borderRadius: '6px',
    marginBottom: '20px',
    fontSize: '14px',
    textAlign: 'center',
    border: '1px solid #dc3545'
  },
  errorButton: {
    marginLeft: '10px',
    textDecoration: 'underline',
    background: 'none',
    border: 'none',
    color: '#dc3545',
    cursor: 'pointer',
    fontWeight: '600'
  },
  ordersBox: {
    backgroundColor: '#ffffff',
    padding: '24px',
    minHeight: '400px'
  },
  ordersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  orderCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: '6px',
    padding: '20px',
    transition: 'all 0.2s ease'
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #e0e0e0'
  },
  orderHeaderLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  orderHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  stockSymbol: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#000000',
    margin: 0
  },
  stockName: {
    fontSize: '14px',
    color: '#666666',
    fontWeight: '400'
  },
  modeBadge: {
    fontSize: '18px',
    fontWeight: '700',
    padding: '6px 16px',
    borderRadius: '4px',
    backgroundColor: '#ffffff',
    border: '2px solid currentColor'
  },
  orderDetails: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    rowGap: '12px'
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: '1 1 auto',
    minWidth: '200px'
  },
  detailLabel: {
    fontSize: '14px',
    color: '#666666',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    marginRight: '8px'
  },
  detailValue: {
    fontSize: '14px',
    color: '#000000',
    fontWeight: '600',
    whiteSpace: 'nowrap'
  },
  orderTypeBadge: {
    fontSize: '14px',
    fontWeight: '700',
    padding: '4px 12px',
    borderRadius: '4px',
    backgroundColor: '#ffffff',
    border: '1px solid currentColor'
  },
  statusBadge: {
    fontSize: '14px',
    fontWeight: '700',
    padding: '4px 12px',
    borderRadius: '4px',
    backgroundColor: '#ffffff',
    border: '1px solid currentColor'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '300px',
    gap: '16px'
  },
  emptyText: {
    fontSize: '16px',
    color: '#666666',
    textAlign: 'center'
  },
  clearButton: {
    padding: '10px 24px',
    backgroundColor: '#000000',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    borderRadius: '6px',
    border: 'none'
  },
  getStartedButton: {
    padding: '10px 24px',
    backgroundColor: '#000000',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    borderRadius: '6px',
    textDecoration: 'none',
    display: 'inline-block'
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
    border: '3px solid #e0e0e0',
    borderTop: '3px solid #000000',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px'
  },
  loadingText: {
    fontSize: '16px',
    color: '#666666'
  }
};

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}