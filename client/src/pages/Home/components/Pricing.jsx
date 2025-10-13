import React, { useState, useEffect } from "react";

function Pricing() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  return (
    <div className="container" style={isMobile ? { padding: "1rem" } : {}}>
      <div
        className="row"
        style={isMobile ? { flexDirection: "column", textAlign: "center" } : {}}
      >
        <div
          className="col-4"
          style={isMobile ? { width: "100%", marginBottom: "1rem" } : {}}
        >
          <h1 className="mb-3 fs-2" style={isMobile ? { fontSize: "1.5rem" } : {}}>
            Unbeatable pricing
          </h1>
          <p style={isMobile ? { fontSize: "0.95rem", lineHeight: "1.4" } : {}}>
            We pioneered the concept of discount broking and price transparency
            in India. Flat fees and no hidden charges.
          </p>
          <a
            href=""
            style={
              isMobile
                ? { textDecoration: "none", fontSize: "0.95rem", display: "inline-block", marginTop: "0.5rem" }
                : { textDecoration: "none" }
            }
          >
            See Pricing <i className="fa fa-long-arrow-right" aria-hidden="true"></i>
          </a>
        </div>

        <div className={isMobile ? "" : "col-2"}></div>

        <div
          className={isMobile ? "" : "col-6 mb-5"}
          style={isMobile ? { width: "100%" } : {}}
        >
          <div
            className="row text-center"
            style={isMobile ? { flexDirection: "column", gap: "0.5rem" } : {}}
          >
            <div
              className="col p-3 border"
              style={isMobile ? { width: "100%", padding: "1rem" } : {}}
            >
              <h1 className="mb-3">₹0</h1>
              <p>
                Free equity delivery and
                <br />
                direct mutual funds
              </p>
            </div>
            <div
              className="col p-3 border"
              style={isMobile ? { width: "100%", padding: "1rem", marginTop: "0.5rem" } : {}}
            >
              <h1 className="mb-3">₹20</h1>
              <p>Intraday and F&O</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Pricing;
