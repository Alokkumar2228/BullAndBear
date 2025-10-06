import React, { useState, useEffect } from "react";
import assets from "@/assets";

function Education() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  return (
    <div
      className="container mt-5"
      style={isMobile ? { padding: "1rem" } : {}}
    >
      <div
        className="row"
        style={isMobile ? { flexDirection: "column", textAlign: "center" } : {}}
      >
        {/* Left image */}
        <div
          className="col-6"
          style={isMobile ? { width: "100%", marginBottom: "1rem" } : {}}
        >
          <img
            src={assets.illustrations.education}
            alt="Education"
            style={isMobile ? { width: "80%", margin: "0 auto" } : { width: "70%" }}
          />
        </div>

        {/* Right content */}
        <div
          className="col-6"
          style={isMobile ? { width: "100%", textAlign: "center" } : {}}
        >
          <h1 className="mb-3 fs-2" style={isMobile ? { fontSize: "1.5rem" } : {}}>
            Free and open market education
          </h1>
          <p style={isMobile ? { fontSize: "0.95rem", lineHeight: "1.5" } : {}}>
            Varsity, the largest online stock market education book in the world
            covering everything from the basics to advanced trading.
          </p>
          <a
            href=""
            style={isMobile ? { textDecoration: "none", fontSize: "0.95rem", display: "inline-block", marginTop: "0.5rem" } : { textDecoration: "none" }}
          >
            Versity <i className="fa fa-long-arrow-right" aria-hidden="true"></i>
          </a>

          <p
            className="mt-5"
            style={isMobile ? { fontSize: "0.95rem", lineHeight: "1.5", marginTop: "1.5rem" } : {}}
          >
            TradingQ&A, the most active trading and investment community in
            India for all your market related queries.
          </p>
          <a
            href=""
            style={isMobile ? { textDecoration: "none", fontSize: "0.95rem", display: "inline-block", marginTop: "0.5rem" } : { textDecoration: "none" }}
          >
            TradingQ&A <i className="fa fa-long-arrow-right" aria-hidden="true"></i>
          </a>
        </div>
      </div>
    </div>
  );
}

export default Education;
