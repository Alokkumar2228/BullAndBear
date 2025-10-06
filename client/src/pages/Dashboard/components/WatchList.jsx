import React, { useState, useContext } from "react";
import { ContextApi } from "@/context/ContextApi";
import { GeneralContext } from "@/pages/Dashboard/components/GeneralContext";

// import GeneralContext from "./GeneralContext";

import { Tooltip, Grow } from "@mui/material";

import {
  BarChartOutlined,
  KeyboardArrowDown,
  KeyboardArrowUp,
  MoreHoriz,
} from "@mui/icons-material";

// import { watchlist } from '@/pages/Dashboard/data/data';
// import { DoughnutChart } from "./DoughnoutChart";

const WatchList = () => {
  const { watchlist } = useContext(ContextApi);

  /* Commented out chart data until DoughnutChart component is used
  const labels = watchlist.map((subArray) => subArray["name"]);
  const data = {
    labels,
    datasets: [
      {
        label: "Price",
        data: watchlist.map((stock) => stock.price),
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
          "rgba(255, 159, 64, 0.5)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };
  */

  return (
    <div className="watchlist-container">
      <div className="search-container">
        <input
          type="text"
          name="search"
          id="search"
          placeholder="Search eg:infy, bse, nifty fut weekly, gold mcx"
          className="search"
        />
        <span className="counts"> {watchlist.length} / 50</span>
      </div>

      <ul className="list">
        {watchlist.map((stock, index) => {
          return <WatchListItem stock={stock} key={index} />;
        })}
      </ul>

      {/* <DoughnutChart data={data} /> */}
    </div>
  );
};

export default WatchList;

const WatchListItem = ({ stock }) => {
  const [showWatchlistActions, setShowWatchlistActions] = useState(false);

  const handleMouseEnter = () => {
    setShowWatchlistActions(true);
  };

  const handleMouseLeave = () => {
    setShowWatchlistActions(false);
  };

  return (
    <li onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className="item">
        <p className={stock.isDown ? "down" : "up"}>{stock.name}</p>
        <div className="itemInfo">
          <span className="percent">{stock.percent}</span>
          {stock.isDown ? (
            <KeyboardArrowDown className="down" />
          ) : (
            <KeyboardArrowUp className="down" />
          )}
          <span
            className="price"
            style={{ color: stock.isDown ? "red" : "green", fontWeight: "600" }}
          >
            {stock.price}
          </span>
        </div>
      </div>
      {showWatchlistActions && (
        <WatchListActions uid={stock.name} data={stock} />
      )}
    </li>
  );
  
};

const WatchListActions = ({ uid, data }) => {
  const { handleOpenBuyWindow } = useContext(GeneralContext);

  const handleBuyClick = () => {
    handleOpenBuyWindow(uid, data);
  };

  return (
    <span className="actions">
      <span>
        <Tooltip
          title="Buy (B)"
          placement="top"
          arrow
          TransitionComponent={Grow}
          onClick={handleBuyClick}
        >
          <button
            style={{
              background: "linear-gradient(135deg, #4caf50 0%, #43a047 100%)",
              color: "#fff",
              border: "1px solid #43a047",
              borderRadius: "6px",
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(76, 175, 80, 0.3)",
              transition: "all 0.2s ease-in-out",
            }}
          >
            Buy
          </button>
        </Tooltip>
        <Tooltip
          title="Sell (S)"
          placement="top"
          arrow
          TransitionComponent={Grow}
        >
          <button
            style={{
              background: "linear-gradient(135deg,rgb(244, 9, 28) 0%,rgb(251, 15, 15) 100%)",
              color: "white",
              border: "1px #ff5722",
              borderRadius: "6px",
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(255, 87, 34, 0.3)",
              transition: "all 0.2s ease-in-out",
            }}
          >
            Sell
          </button>
        </Tooltip>
        <Tooltip
          title="Analytics (A)"
          placement="top"
          arrow
          TransitionComponent={Grow}
        >
          <button
            style={{
              background: "#fff",
              color: "#5f6368",
              border: "1.5px solid #dadce0",
              borderRadius: "6px",
              padding: "6px",
              minWidth: "36px",
              height: "36px",
              // display: "flex",
              // alignItems: "center",
              // justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
              transition: "all 0.2s ease-in-out",
            }}
          >
            <BarChartOutlined style={{ fontSize: "18px", color: "#5f6368" }} />
          </button>
        </Tooltip>
        <Tooltip title="More" placement="top" arrow TransitionComponent={Grow}>
          <button
            style={{
              background: "#fff",
              color: "#5f6368",
              border: "1.5px solid #dadce0",
              borderRadius: "6px",
              padding: "6px",
              minWidth: "36px",
              height: "36px",
              // display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
              transition: "all 0.2s ease-in-out",
            }}
          >
            <MoreHoriz style={{ fontSize: "18px", color: "#5f6368" }} />
          </button>
        </Tooltip>
      </span>
    </span>
  );
};
