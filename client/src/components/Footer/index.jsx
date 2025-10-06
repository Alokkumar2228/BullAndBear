import React, { useState, useEffect } from "react";
import assets from "@/assets";

function Footer() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen(); // initial check
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const footerSections = [
    {
      title: "Company",
      links: [
        { text: "About", href: "#" },
        { text: "Products", href: "#" },
        { text: "Pricing", href: "#" },
        { text: "Referral programme", href: "#" },
        { text: "Careers", href: "#" },
        { text: "Bull&Bear.tech", href: "#" },
        { text: "Press & media", href: "#" },
        { text: "Bull&Bear cares (CSR)", href: "#" },
      ]
    },
    {
      title: "Support",
      links: [
        { text: "Contact", href: "#" },
        { text: "Support portal", href: "#" },
        { text: "Z-Connect blog", href: "#" },
        { text: "List of charges", href: "#" },
        { text: "Downloads & resources", href: "#" },
      ]
    },
    {
      title: "Account",
      links: [
        { text: "Open an account", href: "#" },
        { text: "Fund transfer", href: "#" },
        { text: "60 day challenge", href: "#" },
      ]
    }
  ];

  return (
    <footer
      className="footer"
      style={{
        backgroundColor: "#fafafa",
        borderTop: "1px solid #eee",
        padding: isMobile ? "20px 10px" : "0",
      }}
    >
      <div
        className="footer-container"
        style={{ maxWidth: "1200px", margin: "0 auto" }}
      >
        {/* Main Footer Content */}
        <div
          className="footer-main"
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "center" : "flex-start",
            justifyContent: "space-between",
            gap: isMobile ? "30px" : "60px",
            padding: isMobile ? "40px 0" : "60px 0",
            textAlign: isMobile ? "center" : "left",
          }}
        >
          {/* Logo and Copyright Section */}
          <div
            className="footer-brand"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: isMobile ? "center" : "flex-start",
              flex: isMobile ? "none" : "0 0 250px",
            }}
          >
            <img
              src={assets.logos.main}
              alt="Bull&Bear Logo"
              className="footer-logo"
              style={{ width: isMobile ? "120px" : "160px", marginBottom: "20px" }}
            />
            <p
              className="footer-copyright"
              style={{
                color: "#777",
                fontSize: isMobile ? "12px" : "14px",
                lineHeight: "1.6",
              }}
            >
              &copy; 2010 - 2024, Bull&Bear Broking Ltd.<br />
              All rights reserved.
            </p>
          </div>

          {/* Footer Links Sections */}
          <div
            className="footer-sections"
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: isMobile ? "30px" : "40px",
              flex: 1,
            }}
          >
            {footerSections.map((section, index) => (
              <div
                key={index}
                className="footer-section"
                style={{ textAlign: isMobile ? "center" : "left" }}
              >
                <h6
                  className="footer-title"
                  style={{
                    fontWeight: 600,
                    color: "#333",
                    fontSize: "16px",
                    marginBottom: "20px",
                    position: "relative",
                    paddingBottom: "8px",
                  }}
                >
                  {section.title}
                  <span
                    style={{
                      content: "''",
                      position: "absolute",
                      bottom: 0,
                      left: isMobile ? "50%" : 0,
                      transform: isMobile ? "translateX(-50%)" : "none",
                      width: "30px",
                      height: "2px",
                      backgroundColor: "#387ed1",
                    }}
                  ></span>
                </h6>
                <ul
                  className="footer-links"
                  style={{ listStyle: "none", padding: 0, margin: 0 }}
                >
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex} style={{ marginBottom: "12px" }}>
                      <a
                        href={link.href}
                        className="footer-link"
                        style={{
                          color: "#666",
                          textDecoration: "none",
                          fontSize: isMobile ? "12px" : "14px",
                          transition: "color 0.2s ease",
                        }}
                      >
                        {link.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Legal Disclaimer Section */}
        <div
          className="footer-disclaimer"
          style={{
            borderTop: "1px solid #eee",
            padding: isMobile ? "20px 0" : "40px 0",
          }}
        >
          <div
            className="disclaimer-content"
            style={{
              fontSize: isMobile ? "10px" : "12px",
              lineHeight: 1.5,
              color: "#777",
            }}
          >
            {/* Keep all your disclaimer content here as-is */}

            <p>
              <strong>Bull&Bear Broking Ltd.:</strong> Member of NSE & BSE - SEBI Registration no.: INZ000031633
              CDSL: Depository services through Bull&Bear Securities Pvt. Ltd. – SEBI Registration no.: IN-DP-100-2015 
              Commodity Trading through Bull&Bear Commodities Pvt. Ltd. MCX: 46025 – SEBI Registration no.: INZ000038238 
              Registered Address: Bull&Bear Broking Ltd., #153/154, 4th Cross, Dollars Colony, Opp. Clarence Public School, 
              J.P Nagar 4th Phase, Bengaluru - 560078, Karnataka, India. For any complaints pertaining to securities 
              broking please write to <a href="mailto:complaints@Bull&Bear.com" style={{ color: "#387ed1" }}>complaints@Bull&Bear.com</a>, 
              for DP related to <a href="mailto:dp@Bull&Bear.com" style={{ color: "#387ed1" }}>dp@Bull&Bear.com</a>. 
              Please ensure you carefully read the Risk Disclosure Document as prescribed by SEBI | ICF
            </p>
            
            <p>
              <strong>Procedure to file a complaint on SEBI SCORES:</strong> Register on SCORES portal. Mandatory details 
              for filing complaints on SCORES: Name, PAN, Address, Mobile Number, E-mail ID. 
              <strong>Benefits:</strong> Effective Communication, Speedy redressal of the grievances
            </p>

            <p>
              "Prevent unauthorised transactions in your account. Update your mobile numbers/email IDs with your stock brokers. 
              Receive information of your transactions directly from Exchange on your mobile/email at the end of the day. 
              Issued in the interest of investors. KYC is one time exercise while dealing in securities markets - once KYC is 
              done through a SEBI registered intermediary (broker, DP, Mutual Fund etc.), you need not undergo the same process 
              again when you approach another intermediary." Dear Investor, if you are subscribing to an IPO, there is no need 
              to issue a cheque. Please write the Bank account number and sign the IPO application form to authorize your bank 
              to make payment in case of allotment. In case of non allotment the funds will remain in your bank account. As a 
              business we don't give stock tips, and have not authorized anyone to trade on behalf of others. If you find anyone 
              claiming to be part of Bull&Bear and offering such services, please 
              <a href="#" style={{ color: "#387ed1" }}> create a ticket here</a>.
            </p>
            
            {/* ...your long legal disclaimer content */}
            
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
