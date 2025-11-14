import React, { useState, useContext } from "react";
import { ContextApi } from "@/context/ContextApi";
import { GeneralContext } from "@/pages/Dashboard/components/GeneralContext";
import TradingViewWidget from "@/pages/Dashboard/components/TradingViewWidget";
import ViewNews from "@/pages/Dashboard/components/ViewNews";
import CompanyAnalysis from "@/pages/Dashboard/components/CompanyAnalysis";

import {
  Tooltip,
  Grow,
  Dialog,
  DialogContent,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import {
  BarChartOutlined,
  KeyboardArrowDown,
  KeyboardArrowUp,
  MoreHoriz,
} from "@mui/icons-material";

// ========================
// MAIN WATCHLIST COMPONENT
// ========================
const WatchList = () => {
  const { watchlist } = useContext(ContextApi);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter watchlist based on search term
  const filteredWatchlist = watchlist.filter(
    (stock) =>
      stock.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.symbol?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="watchlist-container">
      {/* Search bar */}
      <div className="search-container">
        <input
          type="text"
          name="search"
          id="search"
          placeholder="🔍 Search eg: INFY, BSE, NIFTY FUT, GOLD MCX"
          className="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 14px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            fontSize: "14px",
            outline: "none",
          }}
        />
        <span className="counts">{filteredWatchlist.length}</span>
      </div>

      {/* List rendering */}
      <ul className="list">
        {filteredWatchlist.length > 0 ? (
          filteredWatchlist.map((stock, index) => (
            <WatchListItem stock={stock} key={index} />
          ))
        ) : (
          <li style={{ textAlign: "center", padding: "10px", color: "#888" }}>
            No results found
          </li>
        )}
      </ul>
    </div>
  );
};

export default WatchList;

// ========================
// WATCHLIST ITEM COMPONENT
// ========================
const WatchListItem = ({ stock }) => {
  const [showWatchlistActions, setShowWatchlistActions] = useState(false);

  return (
    <li
      onMouseEnter={() => setShowWatchlistActions(true)}
      onMouseLeave={() => setShowWatchlistActions(false)}
    >
      <div className="item" style={{ cursor: "move" }}>
        <p className={stock.isDown ? "down" : "up"}>{stock.name}</p>
        <div className="itemInfo">
          <span className="percent">{stock.percent}</span>
          {stock.isDown ? (
            <KeyboardArrowDown className="down" />
          ) : (
            <KeyboardArrowUp className="up" />
          )}
          <span
            className="price"
            style={{
              color: stock.isDown ? "red" : "green",
              fontWeight: "600",
            }}
          >
            {stock.price}
          </span>
        </div>
      </div>

      {/* Action buttons (shown on hover) */}
      {showWatchlistActions && (
        <WatchListActions uid={stock.name} data={stock} symbol={stock.symbol}/>
      )}
    </li>
  );
};

// ========================
// ACTION BUTTONS COMPONENT
// ========================
const WatchListActions = ({ uid, data ,symbol }) => {
  const { handleOpenBuyWindow } = useContext(GeneralContext);
  const [showChart, setShowChart] = useState(false);
  const [showNews, setShowNews] = useState(false);
  const [showBalanceSheet, setShowBalanceSheet] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleBuyClick = () => handleOpenBuyWindow(uid, data);
  const handleChartClick = () => setShowChart(true);
  const handleCloseChart = () => setShowChart(false);
  const handleNewsClick = () => {
    setShowNews(true);
    setAnchorEl(null); // Close the menu
  };
  const handleCloseNews = () => setShowNews(false);
  const handleMoreClick = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMore = () => setAnchorEl(null);

  const viewAnalysis = () => {
    setShowBalanceSheet(true);
    setAnchorEl(null); // Close the menu
  };

  const handleCloseBalanceSheet = () => setShowBalanceSheet(false);

  return (
    <>
      {/* === ACTION BUTTONS === */}
      <span
        className="actions"
        style={{ display: "flex", gap: "6px", alignItems: "center" }}
      >
        {/* Buy */}
        <Tooltip title="Buy (B)" placement="top" arrow>
          <button
            onClick={handleBuyClick}
            style={{
              background: "linear-gradient(135deg, #4caf50 0%, #43a047 100%)",
              color: "#fff",
              border: "1px solid #43a047",
              borderRadius: "6px",
              padding: "6px 12px",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(76, 175, 80, 0.3)",
              transition: "all 0.2s ease-in-out",
            }}
          >
            Buy
          </button>
        </Tooltip>

        {/* Sell */}
        <Tooltip title="Sell (S)" placement="top" arrow>
          <button
            style={{
              background:
                "linear-gradient(135deg, rgb(244, 9, 28) 0%, rgb(251, 15, 15) 100%)",
              color: "white",
              border: "1px solid rgb(251, 15, 15)",
              borderRadius: "6px",
              padding: "6px 12px",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(255, 87, 34, 0.3)",
              transition: "all 0.2s ease-in-out",
            }}
          >
            Sell
          </button>
        </Tooltip>

        {/* Analytics */}
        <Tooltip title="Analytics (A)" placement="top" arrow TransitionComponent={Grow}>
          <button
            onClick={handleChartClick}
            style={{
              background: "#fff",
              color: "#5f6368",
              border: "1.5px solid #dadce0",
              borderRadius: "6px",
              padding: "6px",
              minWidth: "32px",
              height: "32px",
              cursor: "pointer",
              boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
              transition: "all 0.2s ease-in-out",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BarChartOutlined style={{ fontSize: "16px", color: "#5f6368" }} />
          </button>
        </Tooltip>

        {/* More */}
        <Tooltip title="More" placement="top" arrow TransitionComponent={Grow}>
          <button
            onClick={handleMoreClick}
            style={{
              background: "#fff",
              color: "#5f6368",
              border: "1.5px solid #dadce0",
              borderRadius: "6px",
              padding: "6px",
              minWidth: "32px",
              height: "32px",
              cursor: "pointer",
              boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
              transition: "all 0.2s ease-in-out",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MoreHoriz style={{ fontSize: "16px", color: "#5f6368" }} />
          </button>
        </Tooltip>
      </span>

      {/* === MORE MENU === */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMore}
        anchorOrigin={{
          vertical: "center",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "center",
          horizontal: "left",
        }}
        PaperProps={{
          style: {
            minWidth: "150px",
            maxWidth: "150px",
          },
        }}
        MenuListProps={{
          style: {
            padding: "2px 0",
          },
        }}
      >
        <MenuItem
          onClick={viewAnalysis}
          style={{
            fontSize: "10px",
            padding: "6px 12px",
          }}
        >
          View Balance Sheet
        </MenuItem>
        <MenuItem
          onClick={handleNewsClick}
          style={{
            fontSize: "10px",
            padding: "6px 12px",
          }}
        >
          View News
        </MenuItem>
      </Menu>

      {/* === CHART DIALOG === */}
      <Dialog
        open={showChart}
        onClose={handleCloseChart}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          style: {
            minHeight: "80vh",
            maxHeight: "90vh",
            backgroundColor: "#0F0F0F",
          },
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 24px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            backgroundColor: "#0F0F0F",
          }}
        >
          <div>
            <span style={{ fontSize: "20px", fontWeight: "600", color: "#fff" }}>
              {data.name}
            </span>
            <span
              style={{
                marginLeft: "16px",
                fontSize: "16px",
                color: data.isDown ? "#f44336" : "#4caf50",
                fontWeight: "600",
              }}
            >
              {data.price} ({data.percent})
            </span>
          </div>
          <IconButton onClick={handleCloseChart} size="small" style={{ color: "#fff" }}>
            <CloseIcon />
          </IconButton>
        </div>
        <DialogContent style={{ padding: 0, backgroundColor: "#0F0F0F" }}>
          <div style={{ height: "calc(80vh - 80px)", width: "100%" }}>
            <TradingViewWidget symbol={data.symbol} />
          </div>
        </DialogContent>
      </Dialog>

      {/* === BALANCE SHEET DIALOG === */}
      <Dialog
        open={showBalanceSheet}
        onClose={handleCloseBalanceSheet}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          style: {
            minHeight: "80vh",
            maxHeight: "90vh",
          },
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 24px",
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <div>
            <span style={{ fontSize: "20px", fontWeight: "600" }}>
              Balance Sheet - {data.name}
            </span>
            <span
              style={{
                marginLeft: "16px",
                fontSize: "14px",
                color: "#666",
              }}
            >
              ({symbol})
            </span>
          </div>
          <IconButton onClick={handleCloseBalanceSheet} size="small">
            <CloseIcon />
          </IconButton>
        </div>
        <DialogContent style={{ padding: "24px" }}>
          <CompanyAnalysis symbol={symbol} />
        </DialogContent>
      </Dialog>

      {/* === NEWS POPUP === */}
      <ViewNews 
        isOpen={showNews} 
        onClose={handleCloseNews} 
      />
    </>
  );
};