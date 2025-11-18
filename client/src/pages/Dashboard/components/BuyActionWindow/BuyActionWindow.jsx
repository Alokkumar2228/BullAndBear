import React, { useState, useContext } from "react";
import { GeneralContext } from "@/pages/Dashboard/components/GeneralContext";
import "./BuyActionWindow.css";
import { toast } from "react-toastify";

const BuyActionWindow = ({ data }) => {
  const {
 createOrderAPI,
    isLoading,
    error,
    setError,
    marketError,
    setMarketError,
    findTransactionData,
    findUserFundsData,
    handleCloseBuyWindow,
    userFundData,  
  } = useContext(GeneralContext);
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(data?.price || 0.0);
  const currency = "USD";
  const [orderType, setOrderType] = useState("DELIVERY");
  const [orderMode, setOrderMode] = useState("MARKET");

  

  const orderTypes = [
    { value: "INTRADAY", label: "Intraday" },
    { value: "DELIVERY", label: "Delivery" },
    { value: "FNO", label: "F&O" },
  ];


  // // Market hours check (9:15 AM to 3:30 PM IST, Monday to Friday)
  const isMarketOpen = () => {
    const now = new Date();
    const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));

    const day = istTime.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const hours = istTime.getHours();
    const minutes = istTime.getMinutes();
    const currentTime = hours * 60 + minutes;

    // Market is closed on weekends
    if (day === 0 || day === 6) {
      return false;
    }

    // Market hours: 9:15 AM (555 minutes) to 3:30 PM (930 minutes)
    const marketOpenTime = 9 * 60 + 15; // 9:15 AM
    const marketCloseTime = 15 * 60 + 30; // 3:30 PM

    return currentTime >= marketOpenTime && currentTime <= marketCloseTime;
  };


  const orderData = {
    symbol: data.symbol,
    mode: "BUY",
    name: data.name,
    quantity: stockQuantity,
    purchasePrice: stockPrice,
    actualPrice: data.price,
    changePercent: data.changePercent,
    orderType,
    currency,
  };


  // Calculate required amount and buying power
  const getMarginInfo = () => {
    // displayedTotal uses the price shown in the input (stockPrice)
    const displayedTotal = Number(stockQuantity) * Number(stockPrice || 0);

    // User available balance (fallback to 0)
    const availableBalance = Number(userFundData?.balance || 0);

    if (orderType === "INTRADAY") {
      // Platform margin: 50% (2x buying power)
      const marginPercent = 0.5;

      // The amount user must put up now (based on displayed/margin price)
      const requiredAmount = displayedTotal; // stockPrice should already reflect margin price for INTRADAY

      // Buying power expressed as the total market value user can control with their balance
      const buyingPowerValue = availableBalance / marginPercent; // e.g., balance * 2 for 50% margin

      // Max quantity the user could buy at actual market price using full buying power
      const maxQuantityByFunds = data.price
        ? Math.floor(buyingPowerValue / Number(data.price))
        : 0;

      const insufficientFunds = requiredAmount > availableBalance;

      return {
        requiredAmount,
        buyingPower: buyingPowerValue,
        availableBalance,
        marginText: `${currency === "USD" ? "$" : "₹"}${requiredAmount.toFixed(
          2
        )}`,
        buyingPowerText: `Buying Power (2x): ${
          currency === "USD" ? "$" : "₹"
        }${buyingPowerValue.toFixed(2)} (Max Qty: ${maxQuantityByFunds})`,
        insufficientFunds,
      };
    }

    return {
      requiredAmount: displayedTotal,
      // Only INTRADAY should expose buyingPower; for DELIVERY/FNO hide it by returning null
      buyingPower: null,
      availableBalance,
      marginText: `${currency === "USD" ? "$" : "₹"}${displayedTotal.toFixed(
        2
      )}`,
      buyingPowerText: null,
      insufficientFunds: displayedTotal > availableBalance,
    };
  };

  // Check if order type is allowed based on market hours
  const isOrderTypeAllowed = () => {
    if (orderType === "INTRADAY" || orderType === "DELIVERY" || orderType === "FNO") {
      return isMarketOpen();
    }
    return true;
  };

  // Get valuable market info message
  const getMarketInfoMessage = () => {
    if (
      orderType === "INTRADAY" ||
      orderType === "DELIVERY" ||
      orderType === "FNO"
    ) {
      const now = new Date();
      const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
      const day = istTime.getDay();
      const hours = istTime.getHours();
      const minutes = istTime.getMinutes();
      const currentTime = hours * 60 + minutes;
      const orderTypeLabel = orderType === "INTRADAY" ? "Intraday" : orderType === "DELIVERY" ? "Delivery" : "F&O";
      if (isMarketOpen()) {
        const closeTime = 15 * 60 + 30; // 3:30 PM
        const remainingMinutes = closeTime - currentTime;
        const remainingHours = Math.floor(remainingMinutes / 60);
        const remainingMins = remainingMinutes % 60;
        return `🟢 Market is OPEN - ${orderTypeLabel} orders available (${remainingHours}h ${remainingMins}m until closing at 3:30 PM)`;
      } else if (day === 0 || day === 6) {
        // Weekend - show next Monday opening
        const daysUntilMonday = day === 0 ? 1 : 2; // Sunday=0, Saturday=6
        return `🔴 Market CLOSED (Weekend) - ${orderTypeLabel} orders unavailable until Monday 9:15 AM (${daysUntilMonday} day${daysUntilMonday > 1 ? 's' : ''} away)`;
      } else {
        // Weekday but outside market hours
        if (currentTime < 9 * 60 + 15) {
          // Before market opens
          const openTime = 9 * 60 + 15;
          const minutesUntilOpen = openTime - currentTime;
          const hoursUntilOpen = Math.floor(minutesUntilOpen / 60);
          const minsUntilOpen = minutesUntilOpen % 60;
          return `🔴 Market CLOSED - ${orderTypeLabel} orders unavailable until ${hoursUntilOpen}h ${minsUntilOpen}m (opens 9:15 AM)`;
        } else {
          // After market closes
          return `🔴 Market CLOSED - ${orderTypeLabel} orders unavailable until tomorrow 9:15 AM`;
        }
      }
    }
    return "";
  };

  const createOrder = async () => {
    setMarketError("");

    await createOrderAPI({
      orderData,
      orderMode,
      stockQuantity,
      stockPrice,
      orderType,

      onSuccess: async () => {
        toast.success("Order placed successfully!");
        handleCloseBuyWindow();
        await findUserFundsData();
        await findTransactionData();
      },
    });
  };


  const handleBuyClick = () => {
    createOrder();
  };

  const handleCancelClick = () => {
    handleCloseBuyWindow();
  };

  if (!data) return null;

  return (
    <div className="trade-popup-overlay" onClick={handleCancelClick}>
      <div className="trade-popup" onClick={(e) => e.stopPropagation()}>
        <div className="trade-popup-header">
          <h3>{data.name}</h3>
        </div>

        <div className="trade-popup-stock-info">
          <p className={data.changePercent < 0 ? "down" : "up"}>
            {data.changePercent < 0 ? (
              <span className="icon">↓</span>
            ) : (
              <span className="icon">↑</span>
            )}
            {Math.abs(data.changePercent).toFixed(2)}%
          </p>
          <span className="stock-price">
            {currency === "USD" ? "$" : "₹"}
            {data.price}
          </span>
        </div>

        <div className="order-type-selector">
          {orderTypes.map((type) => (
            <label
              key={type.value}
              className={`order-type-option ${
                orderType === type.value ? "selected" : ""
              }`}
            >
              <input
                type="radio"
                name="orderType"
                value={type.value}
                checked={orderType === type.value}
                onChange={(e) => {
                  const newType = e.target.value;
                  // Clear any previous error/market messages when switching order type
                  setError(null);
                  setMarketError("");
                  setOrderType(newType);
                  // If user selects INTRADAY, show intraday margin price (50% of actual price)
                  if (newType === "INTRADAY") {
                    setStockPrice(Number(data.price) * 0.5);
                  } else {
                    // For DELIVERY or FNO show full price
                    setStockPrice(Number(data.price));
                  }
                }}
              />
              {type.label}
            </label>
          ))}
        </div>

        {/* Currency is fixed to USD */}

        <div className="buy-action-inputs">
          <fieldset>
            <legend>Qty.</legend>
            <input
              type="number"
              name="qty"
              id="qty"
              onChange={(e) => setStockQuantity(e.target.value)}
              value={stockQuantity}
            />
          </fieldset>
          <fieldset>
            <legend>Price</legend>
            <input
              type="number"
              name="price"
              id="price"
              step="0.05"
              onChange={(e) => setStockPrice(e.target.value)}
              value={stockPrice}
              readOnly={orderMode === "MARKET"}
            />
          </fieldset>
        </div>

        <div className="order-type">
          <label>
            <input
              type="radio"
              name="orderMode"
              value="MARKET"
              checked={orderMode === "MARKET"}
              onChange={() => {
                setOrderMode("MARKET");
                // When switching to MARKET, set price according to current orderType
                if (orderType === "INTRADAY") {
                  setStockPrice(Number(data.price) * 0.5);
                } else {
                  setStockPrice(Number(data.price));
                }
              }}
            />
            Market
          </label>
          <label>
            <input
              type="radio"
              name="orderMode"
              value="LIMIT"
              checked={orderMode === "LIMIT"}
              onChange={() => setOrderMode("LIMIT")}
            />
            Limit
          </label>
        </div>

        <div className="trade-popup-actions">
          {error && <div className="error-message">{error}</div>}
          {marketError && (
            <div className="market-error-message">{marketError}</div>
          )}
          {getMarketInfoMessage() && (
            <div className="market-info-message">{getMarketInfoMessage()}</div>
          )}
          {(() => {
            const marginInfo = getMarginInfo();
            return (
              <>
                {/* If intraday (buyingPower available) show amount on left and label on right */}
                <div style={{ width: "100%" }}>
                  <div
                    className="margin-text"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <span style={{ color: "#2563eb", fontWeight: 600 }}>
                      {orderType === "INTRADAY" ? "Margin (2x)" : "Total"}
                    </span>
                    <strong style={{ color: "#000" }}>
                      {marginInfo.marginText}
                    </strong>
                  </div>
                  {marginInfo.insufficientFunds && (
                    <div className="insufficient-funds" style={{ color: '#b91c1c', fontSize: '12px', marginTop: 6 }}>
                      Insufficient funds: required {currency === 'USD' ? '$' : '₹'}{Number(marginInfo.requiredAmount).toFixed(2)} — available {currency === 'USD' ? '$' : '₹'}{Number(marginInfo.availableBalance).toFixed(2)}
                    </div>
                  )}
                </div>
              </>
            );
          })()}

          <div className="action-buttons">
            <button
              className={`buy-btn ${isLoading ? "loading" : ""} ${!isOrderTypeAllowed() ? "disabled" : ""}`} 
              onClick={handleBuyClick}
              disabled={isLoading || !stockQuantity || !stockPrice || !isOrderTypeAllowed() }
            >
              {isLoading ? "Placing Order..." : "Buy"}
            </button>
            <button
              className="cancel-btn"
              onClick={handleCancelClick}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyActionWindow;
