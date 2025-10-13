import React, { useState, useEffect } from "react";

function Hero() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  return (
    <section
      className="container-fluid"
      id="supportHero"
      style={isMobile ? { padding: "1rem" } : {}}
    >
      <div
        className="p-5"
        id="supportWrapper"
        style={isMobile ? { textAlign: "center", padding: "2rem 1rem" } : {}}
      >
        <h4 style={isMobile ? { fontSize: "1.2rem" } : {}}>Support Portal</h4>
        <a href="" style={isMobile ? { display: "block", marginTop: "1rem" } : {}}>
          Track Tickets
        </a>
      </div>

      <div
        className="row p-5 m-3"
        style={isMobile ? { flexDirection: "column", padding: "1rem" } : {}}
      >
        <div
          className="col-6 p-3"
          style={isMobile ? { width: "100%", marginBottom: "2rem" } : {}}
        >
          <h1
            className="fs-3"
            style={isMobile ? { fontSize: "1.2rem", textAlign: "center" } : {}}
          >
            Search for an answer or browse help topics to create a ticket
          </h1>
          <input
            placeholder="Eg. how do I activate F&O"
            style={isMobile ? { width: "100%", marginTop: "1rem", padding: "0.5rem" } : {}}
          />
          <br />
          <div style={isMobile ? { display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "1rem" } : {}}>
            <a href="">Track account opening</a>
            <a href="">Track segment activation</a>
            <a href="">Intraday margins</a>
            <a href="">Kite user manual</a>
          </div>
        </div>

        <div
          className="col-6 p-3"
          style={isMobile ? { width: "100%" } : {}}
        >
          <h1
            className="fs-3"
            style={isMobile ? { fontSize: "1.2rem", textAlign: "center", marginBottom: "1rem" } : {}}
          >
            Featured
          </h1>
          <ol style={isMobile ? { paddingLeft: "1rem" } : {}}>
            <li>
              <a href="">Current Takeovers and Delisting - January 2024</a>
            </li>
            <li>
              <a href="">Latest Intraday leverages - MIS & CO</a>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}

export default Hero;
