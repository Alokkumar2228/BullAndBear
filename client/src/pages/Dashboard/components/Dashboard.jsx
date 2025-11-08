import React from "react";
import { Route, Routes } from "react-router-dom";
import './dashboard.css'
import Funds from '@/pages/Dashboard/components/Funds';
import Holdings from '@/pages/Dashboard/components/Holdings';
import Orders from '@/pages/Dashboard/components/Orders';
import Positions from '@/pages/Dashboard/components/Positions';
import Summary from '@/pages/Dashboard/components/Summary';
import WatchList from '@/pages/Dashboard/components/WatchList';
import {GeneralContextProvider} from '@/pages/Dashboard/components/GeneralContext';
import TradingViewWidget from "@/pages/Dashboard/components/TradingViewWidget";
import NewsButton from "@/pages/Dashboard/components/NewsButton";
// import WatchList from "./WatchList";


const Dashboard = ({user}) => {
  return (
    <div className="dashboard-container">
     <GeneralContextProvider>
       <WatchList  user={user} />
       <NewsButton />
     
    
     
      <div className="content">
        <Routes>
          <Route exact path="/" element={<Summary user={user} />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/holdings" element={<Holdings />} />
          <Route path="/positions" element={<Positions />} />
          <Route path="/funds" element={<Funds />} />
          {/* <Route path="/apps" element={<Apps />} /> */}
          <Route path = "/company_analysis?symbol=${symbol}" element ={<TradingViewWidget/>}/>
        </Routes>
        
      </div>
      </GeneralContextProvider>
    </div>
  );
};

export default Dashboard;
