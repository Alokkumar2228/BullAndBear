import React, { useState, useContext } from "react";
import {createOrder } from "@/pages/Dashboard/utils"
import {useAuth} from "@clerk/clerk-react";
import { GeneralContext } from "./GeneralContext";

const Funds = () => {
  const {getToken} = useAuth();
  const {userFundData,transactionData,findTransactionData,findUserFundsData} = useContext(GeneralContext);

  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const [amount, setAmount] = useState('');

  // console.log("fund" , userFundData);

  // Get data from context API
  const fundsData = {
    totalBalance: userFundData?.balance || 0,
    investedAmount: userFundData?.investedAmount || 0,
    withdrawnFunds: userFundData?.withdrawAmount || 0,
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const handleAddFunds = async() => {
     const authToken = await getToken();
    const addAmount = parseFloat(amount);
    if (addAmount && addAmount > 0 && addAmount <= 50000) {
      await createOrder(addAmount, authToken,findUserFundsData,findTransactionData);
    }
  };

  const handleCloseModal = () => {
    setShowAddFundsModal(false);
    setAmount('');
  };

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <h2 style={styles.title}>Funds & Portfolio</h2>
          <p style={styles.subtitle}>Manage your trading funds and view portfolio summary</p>
        </div>
        <div style={styles.actionsSection}>
          <button 
            onClick={() => setShowAddFundsModal(true)}
            style={styles.primaryBtn}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span style={styles.btnText}>Add Funds</span>
          </button>
          <button style={styles.secondaryBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={styles.btnText}>Withdraw</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div style={styles.overviewGrid}>
        <div style={{...styles.overviewCard, ...styles.balanceCard}}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Total Balance</h3>
          </div>
          <div style={styles.cardContent}>
            <div style={styles.amountLarge}>{formatCurrency(fundsData.totalBalance)}</div>
            <div style={styles.gainLoss}>
              Available balance in account
            </div>
          </div>
        </div>

        <div style={styles.overviewCard}>
          <div style={styles.cardHeader}>
            <h4 style={styles.cardTitle}>Invested Amount</h4>
          </div>
          <div style={styles.cardContent}>
            <div style={styles.amount}>{formatCurrency(fundsData.investedAmount)}</div>
            <div style={styles.description}>Currently in positions</div>
          </div>
        </div>

        <div style={styles.overviewCard}>
          <div style={styles.cardHeader}>
            <h4 style={styles.cardTitle}>Withdrawn Amount</h4>
          </div>
          <div style={styles.cardContent}>
            <div style={styles.amount}>{formatCurrency(fundsData.withdrawnFunds)}</div>
            <div style={styles.description}>Total withdrawals</div>
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div style={styles.transactionSection}>
        <div style={styles.transactionHeader}>
          <h3 style={styles.sectionTitle}>Transaction History</h3>
          <button 
            onClick={() => setShowTransactions(!showTransactions)}
            style={styles.toggleBtn}
          >
            <span style={styles.toggleBtnText}>{showTransactions ? 'Hide' : 'Show'}</span>
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none"
              style={{
                transform: showTransactions ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease'
              }}
            >
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {showTransactions && (
          <div style={styles.transactionList}>
            {transactionData.map((transaction) => (
              <div key={transaction._id} style={styles.transactionItem}>
                <div style={styles.transactionLeft}>
                  <div style={{
                    ...styles.transactionIcon,
                    backgroundColor: transaction.type === 'credit' ? '#dbeafe' : '#fef3c7'
                  }}>
                    {transaction.mode === 'credit' ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5v14M5 12h14" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12h14" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    )}
                  </div>
                  <div style={styles.transactionDetails}>
                    <div style={styles.transactionDescription}>
                      {transaction.description}
                    </div>
                    <div style={styles.transactionMeta}>
                      {formatDate(transaction.date)} • {transaction.time}
                    </div>
                    <div style={styles.transactionId}>
                      ID: {transaction.transaction_id}
                    </div>
                  </div>
                </div>
                <div style={styles.transactionRight}>
                  <div style={{
                    ...styles.transactionAmount,
                    color: transaction.mode === 'credit' ? '#10b981' : '#ef4444'
                  }}>
                    {transaction.mode === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </div>
                  <div style={styles.transactionStatus}>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: '#d1fae5',
                      color: '#065f46'
                    }}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Funds Modal */}
      {showAddFundsModal && (
        <div style={styles.modalOverlay} onClick={handleCloseModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Add Funds</h3>
              <button 
                onClick={handleCloseModal}
                style={styles.closeButton}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Enter Amount</label>
                <input
                  type="number"
                  placeholder="₹ 0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={styles.amountInput}
                  max="50000"
                  autoFocus
                />
                <div style={styles.inputHelperText}>
                  Maximum amount: ₹50,000 per transaction
                </div>
                {amount && parseFloat(amount) > 50000 && (
                  <div style={styles.errorText}>
                    Amount cannot exceed ₹50,000
                  </div>
                )}
              </div>
              <div style={styles.modalActions}>
                <button 
                  onClick={handleCloseModal}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddFunds}
                  style={{
                    ...styles.addButton,
                    opacity: (!amount || parseFloat(amount) <= 0 || parseFloat(amount) > 50000) ? 0.5 : 1,
                    cursor: (!amount || parseFloat(amount) <= 0 || parseFloat(amount) > 50000) ? 'not-allowed' : 'pointer'
                  }}
                  disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > 50000}
                >
                  Add Amount
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: 'clamp(12px, 3vw, 24px)',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 'clamp(20px, 4vw, 32px)',
    flexWrap: 'wrap',
    gap: '16px'
  },
  titleSection: {
    flex: '1 1 100%',
    '@media (min-width: 640px)': {
      flex: '1 1 auto'
    }
  },
  title: {
    fontSize: 'clamp(22px, 4vw, 28px)',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 4px 0'
  },
  subtitle: {
    color: '#64748b',
    margin: 0,
    fontSize: 'clamp(12px, 2vw, 14px)'
  },
  actionsSection: {
    display: 'flex',
    gap: '8px',
    width: '100%',
    '@media (min-width: 640px)': {
      width: 'auto'
    }
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: 'clamp(10px, 2vw, 12px) clamp(12px, 3vw, 20px)',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: 'clamp(13px, 2vw, 14px)',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    flex: 1,
    '@media (min-width: 640px)': {
      flex: 'initial'
    }
  },
  secondaryBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: 'clamp(10px, 2vw, 12px) clamp(12px, 3vw, 20px)',
    backgroundColor: 'white',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: 'clamp(13px, 2vw, 14px)',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    flex: 1,
    '@media (min-width: 640px)': {
      flex: 'initial'
    }
  },
  btnText: {
    display: 'inline'
  },
  overviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
    gap: 'clamp(12px, 3vw, 20px)',
    marginBottom: 'clamp(20px, 4vw, 32px)'
  },
  overviewCard: {
    backgroundColor: 'white',
    padding: 'clamp(16px, 3vw, 24px)',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0'
  },
  balanceCard: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    color: 'white'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  cardTitle: {
    fontSize: 'clamp(14px, 2.5vw, 16px)',
    fontWeight: '600',
    margin: 0,
    color: 'inherit'
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  amountLarge: {
    fontSize: 'clamp(24px, 5vw, 32px)',
    fontWeight: '700',
    color: 'inherit',
    wordBreak: 'break-word'
  },
  amount: {
    fontSize: 'clamp(20px, 4vw, 24px)',
    fontWeight: '700',
    color: '#1e293b',
    wordBreak: 'break-word'
  },
  gainLoss: {
    fontSize: 'clamp(12px, 2vw, 14px)',
    opacity: 0.9
  },
  description: {
    fontSize: 'clamp(12px, 2vw, 14px)',
    color: '#64748b'
  },
  transactionSection: {
    marginBottom: 'clamp(20px, 4vw, 32px)'
  },
  transactionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    gap: '12px',
    flexWrap: 'wrap'
  },
  sectionTitle: {
    fontSize: 'clamp(18px, 3vw, 20px)',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0
  },
  toggleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: 'clamp(8px, 2vw, 10px) clamp(12px, 3vw, 20px)',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    border: 'none',
    borderRadius: '8px',
    fontSize: 'clamp(12px, 2vw, 14px)',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  toggleBtnText: {
    display: 'inline'
  },
  transactionList: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
    overflow: 'hidden'
  },
  transactionItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 'clamp(12px, 3vw, 20px) clamp(12px, 3vw, 24px)',
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.2s ease',
    gap: '12px',
    flexWrap: 'wrap'
  },
  transactionLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 'clamp(10px, 2vw, 16px)',
    flex: '1 1 200px',
    minWidth: 0
  },
  transactionIcon: {
    width: 'clamp(40px, 8vw, 48px)',
    height: 'clamp(40px, 8vw, 48px)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  transactionDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minWidth: 0,
    flex: 1
  },
  transactionDescription: {
    fontSize: 'clamp(13px, 2.5vw, 15px)',
    fontWeight: '600',
    color: '#1e293b',
    wordBreak: 'break-word'
  },
  transactionMeta: {
    fontSize: 'clamp(11px, 2vw, 13px)',
    color: '#64748b'
  },
  transactionId: {
    fontSize: 'clamp(10px, 1.8vw, 12px)',
    color: '#94a3b8',
    fontFamily: 'monospace',
    wordBreak: 'break-all'
  },
  transactionRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '8px',
    flexShrink: 0
  },
  transactionAmount: {
    fontSize: 'clamp(16px, 3vw, 18px)',
    fontWeight: '700',
    whiteSpace: 'nowrap'
  },
  transactionStatus: {
    display: 'flex',
    alignItems: 'center'
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: 'clamp(10px, 2vw, 12px)',
    fontWeight: '500',
    textTransform: 'capitalize'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px'
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '400px',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column'
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 'clamp(16px, 3vw, 24px) clamp(16px, 3vw, 24px) clamp(12px, 2vw, 16px)',
    borderBottom: '1px solid #f1f5f9'
  },
  modalTitle: {
    fontSize: 'clamp(18px, 3vw, 20px)',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0
  },
  closeButton: {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '6px',
    color: '#64748b',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalBody: {
    padding: 'clamp(12px, 3vw, 16px) clamp(16px, 3vw, 24px) clamp(16px, 3vw, 24px)',
    overflow: 'auto'
  },
  inputGroup: {
    marginBottom: 'clamp(16px, 3vw, 24px)'
  },
  inputLabel: {
    display: 'block',
    fontSize: 'clamp(13px, 2vw, 14px)',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px'
  },
  amountInput: {
    width: '100%',
    padding: 'clamp(12px, 2.5vw, 16px)',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: 'clamp(16px, 3vw, 18px)',
    fontWeight: '500',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    backgroundColor: '#f8fafc',
    boxSizing: 'border-box'
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    flexDirection: 'column',
    '@media (min-width: 400px)': {
      flexDirection: 'row'
    }
  },
  cancelButton: {
    flex: 1,
    padding: 'clamp(10px, 2vw, 12px) clamp(12px, 2vw, 16px)',
    border: '1px solid #d1d5db',
    backgroundColor: 'white',
    color: '#374151',
    borderRadius: '8px',
    fontSize: 'clamp(13px, 2vw, 14px)',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  addButton: {
    flex: 1,
    padding: 'clamp(10px, 2vw, 12px) clamp(12px, 2vw, 16px)',
    border: 'none',
    backgroundColor: '#3b82f6',
    color: 'white',
    borderRadius: '8px',
    fontSize: 'clamp(13px, 2vw, 14px)',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  inputHelperText: {
    fontSize: 'clamp(11px, 2vw, 12px)',
    color: '#64748b',
    marginTop: '6px'
  },
  errorText: {
    fontSize: 'clamp(11px, 2vw, 12px)',
    color: '#ef4444',
    marginTop: '6px',
    fontWeight: '500'
  }
};

export default Funds;