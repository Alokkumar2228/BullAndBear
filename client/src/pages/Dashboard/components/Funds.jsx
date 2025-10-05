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
            Add Funds
          </button>
          <button style={styles.secondaryBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Withdraw
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
            {showTransactions ? 'Hide Transactions' : 'Show Transactions'}
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
                  style={styles.addButton}
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
    padding: '24px',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  titleSection: {
    flex: 1
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 4px 0'
  },
  subtitle: {
    color: '#64748b',
    margin: 0,
    fontSize: '14px'
  },
  actionsSection: {
    display: 'flex',
    gap: '12px'
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textDecoration: 'none'
  },
  secondaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: 'white',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textDecoration: 'none'
  },
  overviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginBottom: '32px'
  },
  overviewCard: {
    backgroundColor: 'white',
    padding: '24px',
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
    fontSize: '16px',
    fontWeight: '600',
    margin: 0,
    color: 'inherit'
  },
  positiveTrend: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500'
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  amountLarge: {
    fontSize: '32px',
    fontWeight: '700',
    color: 'inherit'
  },
  amount: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b'
  },
  gainLoss: {
    fontSize: '14px',
    opacity: 0.9
  },
  description: {
    fontSize: '14px',
    color: '#64748b'
  },
  fundsFlow: {
    marginBottom: '32px'
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '20px'
  },
  flowCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px'
  },
  flowCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  flowIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    backgroundColor: '#dbeafe',
    color: '#3b82f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  flowContent: {
    flex: 1
  },
  flowLabel: {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '4px'
  },
  flowAmount: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '2px'
  },
  flowNote: {
    fontSize: '12px',
    color: '#9ca3af'
  },
  transactionSection: {
    marginBottom: '32px'
  },
  transactionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  toggleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
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
    padding: '20px 24px',
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.2s ease'
  },
  transactionLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flex: 1
  },
  transactionIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  transactionDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  transactionDescription: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1e293b'
  },
  transactionMeta: {
    fontSize: '13px',
    color: '#64748b'
  },
  transactionId: {
    fontSize: '12px',
    color: '#94a3b8',
    fontFamily: 'monospace'
  },
  transactionRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '8px'
  },
  transactionAmount: {
    fontSize: '18px',
    fontWeight: '700'
  },
  transactionStatus: {
    display: 'flex',
    alignItems: 'center'
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
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
    zIndex: 1000
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '400px',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px 24px 16px',
    borderBottom: '1px solid #f1f5f9'
  },
  modalTitle: {
    fontSize: '20px',
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
    transition: 'all 0.2s ease'
  },
  modalBody: {
    padding: '16px 24px 24px'
  },
  inputGroup: {
    marginBottom: '24px'
  },
  inputLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px'
  },
  amountInput: {
    width: '100%',
    padding: '16px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '18px',
    fontWeight: '500',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    backgroundColor: '#f8fafc',
    boxSizing: 'border-box'
  },
  modalActions: {
    display: 'flex',
    gap: '12px'
  },
  cancelButton: {
    flex: 1,
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    backgroundColor: 'white',
    color: '#374151',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  addButton: {
    flex: 1,
    padding: '12px 16px',
    border: 'none',
    backgroundColor: '#3b82f6',
    color: 'white',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    opacity: 1
  },
  inputHelperText: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '6px'
  },
  errorText: {
    fontSize: '12px',
    color: '#ef4444',
    marginTop: '6px',
    fontWeight: '500'
  }
};

export default Funds;