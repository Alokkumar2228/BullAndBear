import React, { useState, useEffect } from "react";
import assets from "@/assets";

const Awards = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  return (
    <div className="container mt-5">
      <div className="row" style={isMobile ? { textAlign: "center" } : {}}>
        {/* Left image */}
        <div
          className="col-6 p-5"
          style={isMobile ? { padding: "1rem", width: "100%" } : {}}
        >
          <img
            src={assets.illustrations.largestBroker}
            alt="Largest Broker"
            style={isMobile ? { width: "80%", margin: "0 auto" } : {}}
          />
        </div>

        {/* Right content */}
        <div
          className="col-6 p-5 mt-5"
          style={
            isMobile
              ? {
                  width: "100%",
                  marginTop: "1rem",
                  padding: "1rem",
                  textAlign: "center",
                }
              : {}
          }
        >
          <h1 style={isMobile ? { fontSize: "1.5rem" } : {}}>
            Largest stock broker in India
          </h1>
          <p
            className="mb-5"
            style={isMobile ? { fontSize: "0.95rem", lineHeight: "1.5" } : {}}
          >
            2+ million clients contribute to over 15% of all retail order
            volumes in India daily by trading and investing in:
          </p>

          <div className="row" style={isMobile ? { textAlign: "left" } : {}}>
            <div className="col-6" style={isMobile ? { padding: "0.5rem" } : {}}>
              <ul style={isMobile ? { paddingLeft: "1rem" } : {}}>
                <li><p>Futures and Options</p></li>
                <li><p>Commodity derivatives</p></li>
                <li><p>Currency derivatives</p></li>
              </ul>
            </div>
            <div className="col-6" style={isMobile ? { padding: "0.5rem" } : {}}>
              <ul style={isMobile ? { paddingLeft: "1rem" } : {}}>
                <li><p>Stocks & IPOs</p></li>
                <li><p>Direct mutual funds</p></li>
                <li><p>Bonds and Govt. Securities</p></li>
              </ul>
            </div>
          </div>

          <img
            src={assets.media.pressLogos}
            alt="Press Logos"
            style={
              isMobile ? { width: "70%", marginTop: "1rem" } : { width: "90%" }
            }
          />
        </div>
      </div>
    </div>
  );
};

export default Awards;
