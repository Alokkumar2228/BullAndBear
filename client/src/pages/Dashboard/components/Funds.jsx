import React from "react";
import { Link } from "react-router-dom";
import './dashboard.css';

const Funds = () => {
  // Sample data - replace with actual data from your API/state
  const fundsData = {
    totalBalance: 7800.40,
    investedAmount: 3757.30,
    addedFunds: 4064.00,
    withdrawnFunds: 21.30,
    availableCash: 4043.10,
    todaysGainLoss: 285.70,
    totalGainLoss: 1543.10
  };

  const equityDetails = {
    openingBalance: 4043.10,
    dayTradeMargin: 3736.40,
    span: 0.00,
    deliveryMargin: 0.00,
    exposure: 0.00,
    optionsPremium: 0.00,
    collateralLiquid: 0.00,
    collateralEquity: 0.00
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="funds-dashboard">
      {/* Header Section */}
      <div className="funds-header">
        <div className="funds-title">
          <h2>Funds & Portfolio</h2>
          <p className="subtitle">Manage your trading funds and view portfolio summary</p>
        </div>
        <div className="funds-actions">
          <Link to="/add-funds" className="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Add Funds
          </Link>
          <Link to="/withdraw" className="btn btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Withdraw
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="funds-overview">
        <div className="overview-card balance-card">
          <div className="card-header">
            <h3>Total Balance</h3>
            <div className="balance-trend positive">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M7 14l5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              +2.4%
            </div>
          </div>
          <div className="card-content">
            <div className="amount-large">{formatCurrency(fundsData.totalBalance)}</div>
            <div className="gain-loss positive">
              Today's P&L: +{formatCurrency(fundsData.todaysGainLoss)}
            </div>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-header">
            <h4>Invested Amount</h4>
          </div>
          <div className="card-content">
            <div className="amount">{formatCurrency(fundsData.investedAmount)}</div>
            <div className="description">Currently in positions</div>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-header">
            <h4>Available Cash</h4>
          </div>
          <div className="card-content">
            <div className="amount">{formatCurrency(fundsData.availableCash)}</div>
            <div className="description">Ready to invest</div>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-header">
            <h4>Total Returns</h4>
          </div>
          <div className="card-content">
            <div className="amount positive">+{formatCurrency(fundsData.totalGainLoss)}</div>
            <div className="description">Overall profit/loss</div>
          </div>
        </div>
      </div>

      {/* Funds Flow Summary */}
      <div className="funds-flow">
        <h3>Funds Summary</h3>
        <div className="flow-cards">
          <div className="flow-card funds-added">
            <div className="flow-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flow-content">
              <div className="flow-label">Funds Added</div>
              <div className="flow-amount">{formatCurrency(fundsData.addedFunds)}</div>
              <div className="flow-note">Total deposits</div>
            </div>
          </div>

          <div className="flow-card funds-withdrawn">
            <div className="flow-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flow-content">
              <div className="flow-label">Funds Withdrawn</div>
              <div className="flow-amount">{formatCurrency(fundsData.withdrawnFunds)}</div>
              <div className="flow-note">Total withdrawals</div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="funds-details">
        <div className="details-section">
          <div className="section-header">
            <h3>Equity Account Details</h3>
            <span className="account-status active">Active</span>
          </div>
          
          <div className="details-grid">
            <div className="detail-group">
              <h4>Margins</h4>
              <div className="detail-items">
                <div className="detail-item">
                  <span className="label">Available Margin</span>
                  <span className="value highlighted">{formatCurrency(fundsData.availableCash)}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Used Margin</span>
                  <span className="value">{formatCurrency(fundsData.investedAmount)}</span>
                </div>
              </div>
            </div>

            <div className="detail-group">
              <h4>Account Balance</h4>
              <div className="detail-items">
                <div className="detail-item">
                  <span className="label">Opening Balance</span>
                  <span className="value">{formatCurrency(equityDetails.openingBalance)}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Day Trade Margin</span>
                  <span className="value">{formatCurrency(equityDetails.dayTradeMargin)}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Payin</span>
                  <span className="value">{formatCurrency(fundsData.addedFunds)}</span>
                </div>
              </div>
            </div>

            <div className="detail-group">
              <h4>Risk Management</h4>
              <div className="detail-items">
                <div className="detail-item">
                  <span className="label">SPAN</span>
                  <span className="value">{formatCurrency(equityDetails.span)}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Delivery Margin</span>
                  <span className="value">{formatCurrency(equityDetails.deliveryMargin)}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Exposure</span>
                  <span className="value">{formatCurrency(equityDetails.exposure)}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Options Premium</span>
                  <span className="value">{formatCurrency(equityDetails.optionsPremium)}</span>
                </div>
              </div>
            </div>

            <div className="detail-group">
              <h4>Collateral</h4>
              <div className="detail-items">
                <div className="detail-item">
                  <span className="label">Liquid Funds</span>
                  <span className="value">{formatCurrency(equityDetails.collateralLiquid)}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Equity Collateral</span>
                  <span className="value">{formatCurrency(equityDetails.collateralEquity)}</span>
                </div>
                <div className="detail-item total">
                  <span className="label">Total Collateral</span>
                  <span className="value">{formatCurrency(equityDetails.collateralLiquid + equityDetails.collateralEquity)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="details-section">
          <div className="section-header">
            <h3>Commodity Account</h3>
            <span className="account-status inactive">Inactive</span>
          </div>
          
          <div className="commodity-cta">
            <div className="cta-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="cta-content">
              <h4>Start Commodity Trading</h4>
              <p>Trade in agricultural commodities, metals, and energy with dedicated commodity account.</p>
              <Link to="/open-commodity" className="btn btn-outline">
                Open Commodity Account
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <div className="actions-header">
          <h3>Quick Actions</h3>
        </div>
        <div className="actions-grid">
          <Link to="/funds-statement" className="action-card">
            <div className="action-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
                <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="action-content">
              <h4>Funds Statement</h4>
              <p>View detailed transaction history</p>
            </div>
          </Link>

          <Link to="/auto-invest" className="action-card">
            <div className="action-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="action-content">
              <h4>Auto Invest</h4>
              <p>Set up automatic investments</p>
            </div>
          </Link>

          <Link to="/bank-details" className="action-card">
            <div className="action-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="action-content">
              <h4>Bank Details</h4>
              <p>Manage linked bank accounts</p>
            </div>
          </Link>

          <Link to="/tax-reports" className="action-card">
            <div className="action-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4M9 11V9a2 2 0 0 1 2-2v0a2 2 0 0 1 2 2v2M9 11h6" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="action-content">
              <h4>Tax Reports</h4>
              <p>Download tax computation reports</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Funds;