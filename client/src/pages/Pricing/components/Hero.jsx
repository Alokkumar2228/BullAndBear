import React, { useState, useEffect } from "react";
import assets from "@/assets";

function Hero() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  return (
    <div className="container">
      {/* Header */}
      <div
        className="row p-5 mt-5 border-bottom text-center"
        style={isMobile ? { padding: "2rem 1rem", marginTop: "2rem" } : {}}
      >
        <h1 style={isMobile ? { fontSize: "1.5rem" } : {}}>Pricing</h1>
        <h3
          className="text-muted mt-3 fs-5"
          style={isMobile ? { fontSize: "1rem" } : {}}
        >
          Free equity investments and flat ₹20 traday and F&O trades
        </h3>
      </div>

      {/* Pricing cards */}
      <div
        className="row p-5 mt-5 text-center"
        style={isMobile ? { flexDirection: "column", padding: "2rem 1rem" } : {}}
      >
        <div
          className="col-4 p-4"
          style={isMobile ? { width: "100%", marginBottom: "2rem" } : {}}
        >
          <img src={assets.illustrations.pricingEquity} style={isMobile ? { width: "80%" } : {}} />
          <h1 className="fs-3" style={isMobile ? { fontSize: "1.2rem" } : {}}>
            Free equity delivery
          </h1>
          <p className="text-muted" style={isMobile ? { fontSize: "0.9rem" } : {}}>
            All equity delivery investments (NSE, BSE), are absolutely free — ₹ 0 brokerage.
          </p>
        </div>

        <div
          className="col-4 p-4"
          style={isMobile ? { width: "100%", marginBottom: "2rem" } : {}}
        >
          <img src={assets.illustrations.intradayTrades} style={isMobile ? { width: "80%" } : {}} />
          <h1 className="fs-3" style={isMobile ? { fontSize: "1.2rem" } : {}}>
            Intraday and F&O trades
          </h1>
          <p className="text-muted" style={isMobile ? { fontSize: "0.9rem" } : {}}>
            Flat Rs. 20 or 0.03% (whichever is lower) per executed order on intraday trades across equity, currency, and commodity trades.
          </p>
        </div>

        <div
          className="col-4 p-4"
          style={isMobile ? { width: "100%", marginBottom: "2rem" } : {}}
        >
          <img src={assets.illustrations.pricingEquity} style={isMobile ? { width: "80%" } : {}} />
          <h1 className="fs-3" style={isMobile ? { fontSize: "1.2rem" } : {}}>
            Free direct MF
          </h1>
          <p className="text-muted" style={isMobile ? { fontSize: "0.9rem" } : {}}>
            All direct mutual fund investments are absolutely free — ₹ 0 commissions & DP charges.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Hero;
