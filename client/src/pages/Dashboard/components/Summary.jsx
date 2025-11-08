import React from "react";
import "./dashboard.css";
import ProfitAndLossGraph from "../components/profitAnadLossGraph";
import NewsButton from "./NewsButton";



const BASE_URL = import.meta.env.VITE_BASE_URL
const Summary = () => {
  const user = localStorage.getItem("user_name");
  return (
    <>
      <div className="username">
        <h6>Hi, {user}!</h6>
        <NewsButton />
        <hr className="divider" />
      </div>
      <ProfitAndLossGraph /> 
    </>
  );
};

export default Summary;
