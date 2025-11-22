import React from "react";
import "./dashboard.css";
import ProfitAndLossGraph from "../components/profitAnadLossGraph";
import NewsButton from "./NewsButton";
import { useUser } from "@clerk/clerk-react";



const BASE_URL = import.meta.env.VITE_BASE_URL
const Summary = () => {
   const { user } = useUser();

   const displayName = user?.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
  return (
    <>
      <div className="username">
        <h6>Hi, {displayName}!</h6>
        <NewsButton />
        <hr className="divider" />
      </div>
      <ProfitAndLossGraph /> 
    </>
  );
};

export default Summary;
