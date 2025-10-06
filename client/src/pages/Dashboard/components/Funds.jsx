import React, { useState, useContext } from "react";
import {createOrder } from "@/pages/Dashboard/utils"
import {useAuth} from "@clerk/clerk-react";
import { GeneralContext } from "./GeneralContext";

const Funds = () => {
  const {getToken} = useAuth();
  const {userFundData,transactionData,
    findTransactionData,findUserFundsData,withdrawFund} = useContext(GeneralContext);

  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Withdraw form states
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');

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

  const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true, // set to false for 24-hour format
  });
};

  const handleAddFunds = async() => {
     const authToken = await getToken();
    const addAmount = parseFloat(amount);
    if (addAmount && addAmount > 0 && addAmount <= 50000) {
      await createOrder(addAmount, authToken,findUserFundsData,findTransactionData);
    }
  };

  const handleWithdraw = async() => {
    const withdrawAmountValue = parseFloat(withdrawAmount);
    
    if (withdrawAmountValue && withdrawAmountValue > 0 && 
        withdrawAmountValue <= fundsData.totalBalance &&
        accountNumber && ifscCode) {
      
      setIsProcessing(true);
      
      // Add your withdraw API call here
      const data = {
        amount: withdrawAmountValue,
        accountNumber,
        ifscCode,
      };

      const response = await withdrawFund(data);

      console.log(response);

      // Show loading for 2 seconds
      setTimeout(async () => {
        if(response && response.success){
          await findUserFundsData();
          await findTransactionData();
          setIsProcessing(false);
          handleCloseWithdrawModal();
        } else {
          setIsProcessing(false);
        }
      }, 2000);
      
    }
  };

  const handleCloseModal = () => {
    setShowAddFundsModal(false);
    setAmount('');
  };

  const handleCloseWithdrawModal = () => {
    setShowWithdrawModal(false);
    setWithdrawAmount('');
    setAccountNumber('');
    setIfscCode('');
    setIsProcessing(false);
  };

  const isWithdrawValid = () => {
    const withdrawAmountValue = parseFloat(withdrawAmount);
    return withdrawAmountValue > 0 && 
           withdrawAmountValue <= fundsData.totalBalance &&
           accountNumber.length >= 9 &&
           ifscCode.length === 11;
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
          <button 
            onClick={() => setShowWithdrawModal(true)}
            style={styles.secondaryBtn}
          >
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
                      {formatDate(transaction.createdAt)} • {formatTime(transaction.createdAt)}
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

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div style={styles.modalOverlay} onClick={!isProcessing ? handleCloseWithdrawModal : undefined}>
          <div style={styles.withdrawModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.withdrawModalHeader}>
              <h3 style={styles.withdrawModalTitle}>Withdraw Funds</h3>
              <p style={styles.withdrawModalSubtitle}>Enter your bank details to withdraw funds</p>
              {!isProcessing && (
                <button 
                  onClick={handleCloseWithdrawModal}
                  style={styles.withdrawCloseButton}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
            </div>
            
            <div style={styles.withdrawModalBody}>
              <div style={styles.availableBalance}>
                <span style={styles.balanceLabel}>Available Balance</span>
                <span style={styles.balanceAmount}>{formatCurrency(fundsData.totalBalance)}</span>
              </div>

              <div style={styles.withdrawInputGroup}>
                <label style={styles.withdrawInputLabel}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{marginRight: '8px'}}>
                    <rect x="2" y="5" width="20" height="14" rx="2" stroke="#3b82f6" strokeWidth="2"/>
                    <path d="M2 10h20" stroke="#3b82f6" strokeWidth="2"/>
                  </svg>
                  Bank Account Number
                </label>
                <input
                  type="text"
                  placeholder="Enter your account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  style={styles.withdrawInput}
                  maxLength="18"
                  disabled={isProcessing}
                />
                {accountNumber && accountNumber.length < 9 && (
                  <div style={styles.errorText}>
                    Account number must be at least 9 digits
                  </div>
                )}
              </div>

              <div style={styles.withdrawInputGroup}>
                <label style={styles.withdrawInputLabel}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{marginRight: '8px'}}>
                    <path d="M21 10H3M16 6v12M8 6v12M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" stroke="#3b82f6" strokeWidth="2"/>
                  </svg>
                  IFSC Code
                </label>
                <input
                  type="text"
                  placeholder="e.g., SBIN0001234"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                  style={styles.withdrawInput}
                  maxLength="11"
                  disabled={isProcessing}
                />
                {ifscCode && ifscCode.length !== 11 && (
                  <div style={styles.errorText}>
                    IFSC code must be exactly 11 characters
                  </div>
                )}
              </div>

              <div style={styles.withdrawInputGroup}>
                <label style={styles.withdrawInputLabel}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{marginRight: '8px'}}>
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Withdrawal Amount
                </label>
                <input
                  type="number"
                  placeholder="₹ 0.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  style={styles.withdrawInput}
                  max={fundsData.totalBalance}
                  disabled={isProcessing}
                />
                <div style={styles.inputHelperText}>
                  Maximum withdrawal: {formatCurrency(fundsData.totalBalance)}
                </div>
                {withdrawAmount && parseFloat(withdrawAmount) > fundsData.totalBalance && (
                  <div style={styles.errorText}>
                    Amount exceeds available balance
                  </div>
                )}
              </div>

              <div style={styles.withdrawModalActions}>
                <button 
                  onClick={handleCloseWithdrawModal}
                  style={styles.withdrawCancelButton}
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleWithdraw}
                  style={{
                    ...styles.withdrawConfirmButton,
                    opacity: (isWithdrawValid() && !isProcessing) ? 1 : 0.5,
                    cursor: (isWithdrawValid() && !isProcessing) ? 'pointer' : 'not-allowed'
                  }}
                  disabled={!isWithdrawValid() || isProcessing}
                >
                  {isProcessing ? (
                    <span style={styles.processingText}>
                      Processing
                      <span style={styles.dots}>
                        <span style={{...styles.dot, animationDelay: '0s'}}>.</span>
                        <span style={{...styles.dot, animationDelay: '0.2s'}}>.</span>
                        <span style={{...styles.dot, animationDelay: '0.4s'}}>.</span>
                      </span>
                    </span>
                  ) : (
                    'Confirm Withdraw'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style>
        {`
          @keyframes dotPulse {
            0%, 100% { opacity: 0; }
            50% { opacity: 1; }
          }
        `}
      </style>
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
  },
  // Withdraw Modal Styles
  withdrawModal: {
    backgroundColor: 'white',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '420px',
    maxHeight: '85vh',
    overflow: 'auto',
    boxShadow: '0 20px 40px -12px rgba(59, 130, 246, 0.25)',
    border: '1px solid #dbeafe'
  },
  withdrawModalHeader: {
    background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)',
    padding: '20px 24px 18px',
    position: 'relative',
    textAlign: 'center',
    borderBottom: '1px solid #bfdbfe'
  },
  withdrawIconWrapper: {
    width: '44px',
    height: '44px',
    backgroundColor: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 12px',
    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)'
  },
  withdrawModalTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 6px 0'
  },
  withdrawModalSubtitle: {
    fontSize: '13px',
    color: '#64748b',
    margin: 0
  },
  withdrawCloseButton: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    border: 'none',
    background: 'white',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '6px',
    color: '#64748b',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  withdrawModalBody: {
    padding: '20px 24px 24px'
  },
  availableBalance: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#eff6ff',
    borderRadius: '10px',
    marginBottom: '20px',
    border: '1px solid #dbeafe'
  },
  balanceLabel: {
    fontSize: '13px',
    color: '#64748b',
    fontWeight: '500'
  },
  balanceAmount: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#3b82f6'
  },
  withdrawInputGroup: {
    marginBottom: '16px'
  },
  withdrawInputLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px'
  },
  withdrawInput: {
    width: '100%',
    padding: '12px 14px',
    border: '2px solid #dbeafe',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '400',
    outline: 'none',
    transition: 'all 0.2s ease',
    backgroundColor: 'white',
    boxSizing: 'border-box',
    color: '#1e293b'
  },
  withdrawModalActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px'
  },
  withdrawCancelButton: {
    flex: 1,
    padding: '12px 18px',
    border: '2px solid #e2e8f0',
    backgroundColor: 'white',
    color: '#64748b',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  withdrawConfirmButton: {
    flex: 1,
    padding: '12px 18px',
    border: 'none',
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: 'white',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
  },
  processingText: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px'
  },
  dots: {
    display: 'inline-flex',
    marginLeft: '2px'
  },
  dot: {
    animation: 'dotPulse 1.4s infinite ease-in-out',
    opacity: 0
  }

}

export default Funds;