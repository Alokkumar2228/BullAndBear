import React, { useState, useEffect } from "react";
import assets from "@/assets";

function Stats() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  return (
    <div className="container p-3">
      <div className="row p-5" style={isMobile ? { flexDirection: "column", padding: "1rem" } : {}}>
        {/* Left content */}
        <div className="col-6 p-5" style={isMobile ? { padding: "1rem", width: "100%" } : {}}>
          <h1 className="fs-2 mb-4" style={isMobile ? { fontSize: "1.5rem", textAlign: "center" } : {}}>Trust with confidence</h1>
          <h2 className="fs-4" style={isMobile ? { fontSize: "1.2rem" } : {}}>Customer-first always</h2>
          <p className="text-muted" style={isMobile ? { fontSize: "0.9rem", lineHeight: "1.4", textAlign: "center" } : {}}>
            That's why 1.3+ crore customers trust Bull&Bear with ₹3.5+ lakh crores
            worth of equity investments.
          </p>
          <h2 className="fs-4" style={isMobile ? { fontSize: "1.2rem" } : {}}>No spam or gimmicks</h2>
          <p className="text-muted" style={isMobile ? { fontSize: "0.9rem", lineHeight: "1.4", textAlign: "center" } : {}}>
            No gimmicks, spam, "gamification", or annoying push notifications.
            High quality apps that you use at your pace, the way you like.
          </p>
          <h2 className="fs-4" style={isMobile ? { fontSize: "1.2rem" } : {}}>The Bull&Bear universe</h2>
          <p className="text-muted" style={isMobile ? { fontSize: "0.9rem", lineHeight: "1.4", textAlign: "center" } : {}}>
            Not just an app, but a whole ecosystem. Our investments in 30+
            fintech startups offer you tailored services specific to your needs.
          </p>
          <h2 className="fs-4" style={isMobile ? { fontSize: "1.2rem" } : {}}>Do better with money</h2>
          <p className="text-muted" style={isMobile ? { fontSize: "0.9rem", lineHeight: "1.4", textAlign: "center" } : {}}>
            With initiatives like Nudge and Kill Switch, we don't just
            facilitate transactions, but actively help you do better with your
            money.
          </p>
        </div>

        {/* Right image and links */}
        <div className="col-6 p-5" style={isMobile ? { padding: "1rem", width: "100%", textAlign: "center", marginTop: "1rem" } : {}}>
          <img src={assets.illustrations.ecosystem} style={isMobile ? { width: "80%", margin: "0 auto" } : { width: "90%" }} alt="Ecosystem" />
          <div className="text-center" style={isMobile ? { marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" } : {}}>
            <a href="" style={{ textDecoration: "none", color: "#0d6efd", fontSize: isMobile ? "0.9rem" : "1rem" }}>
              Explore our products <i className="fa fa-long-arrow-right" aria-hidden="true"></i>
            </a>
            <a href="" style={{ textDecoration: "none", color: "#0d6efd", fontSize: isMobile ? "0.9rem" : "1rem" }}>
              Try Kite demo <i className="fa fa-long-arrow-right" aria-hidden="true"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Stats;
