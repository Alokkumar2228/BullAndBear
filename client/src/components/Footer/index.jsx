import React from "react";
import assets from "@/assets";

function Footer() {
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
    <footer className="footer" style={{ backgroundColor: "#fafafa", borderTop: "1px solid #eee" }}>
      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-main">
          {/* Logo and Copyright Section */}
          <div className="footer-brand">
            <img 
              src={assets.logos.main} 
              alt="Bull&Bear Logo" 
              className="footer-logo"
            />
            <p className="footer-copyright">
              &copy; 2010 - 2024, Bull&Bear Broking Ltd.<br />
              All rights reserved.
            </p>
          </div>

          {/* Footer Links Sections */}
          <div className="footer-sections">
            {footerSections.map((section, index) => (
              <div key={index} className="footer-section">
                <h6 className="footer-title">
                  {section.title}
                </h6>
                <ul className="footer-links">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href={link.href} className="footer-link">
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
        <div className="footer-disclaimer">
          <div className="disclaimer-content">
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
              <strong>Investments in securities market are subject to market risks;</strong> read all the related documents carefully before investing.
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
          </div>
        </div>
      </div>

      {/* Custom CSS */}
      <style>{`
  .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .footer-main {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 60px 0;
          gap: 60px;
        }

        .footer-brand {
          flex: 0 0 250px;
          display: flex;
          flex-direction: column;
        }

        .footer-logo {
          width: 160px;
          height: auto;
          margin-bottom: 20px;
        }

        .footer-copyright {
          color: #777;
          font-size: 14px;
          line-height: 1.6;
          margin: 0;
        }

        .footer-sections {
          flex: 1;
          display: flex;
          justify-content: space-between;
          gap: 40px;
        }

        .footer-section {
          flex: 1;
          min-width: 0;
        }

        .footer-title {
          font-weight: 600;
          color: #333;
          font-size: 16px;
          margin-bottom: 20px;
          position: relative;
          padding-bottom: 8px;
        }

        .footer-title::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0;
          width: 30px;
          height: 2px;
          background-color: #387ed1;
        }

        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-links li {
          margin-bottom: 12px;
        }

        .footer-link {
          color: #666;
          text-decoration: none;
          font-size: 14px;
          transition: color 0.2s ease;
        }

        .footer-link:hover {
          color: #387ed1;
        }

        .footer-disclaimer {
          border-top: 1px solid #eee;
          padding: 40px 0;
        }

        .disclaimer-content {
          font-size: 12px;
          line-height: 1.6;
          color: #777;
        }

        .disclaimer-content p {
          margin-bottom: 16px;
        }

        .disclaimer-content p:last-child {
          margin-bottom: 0;
        }

        /* Tablet Styles */
        @media (max-width: 992px) {
          .footer-main {
            gap: 40px;
          }

          .footer-brand {
            flex: 0 0 220px;
          }

          .footer-sections {
            gap: 30px;
          }

          .footer-logo {
            width: 140px;
          }
        }

        /* Mobile Styles */
        @media (max-width: 768px) {
          .footer-container {
            padding: 0 15px;
          }

          .footer-main {
            flex-direction: column;
            gap: 40px;
            padding: 40px 0;
            text-align: center;
          }

          .footer-brand {
            flex: none;
            align-items: center;
            text-align: center;
          }

          .footer-logo {
            width: 120px;
          }

          .footer-sections {
            flex-direction: column;
            gap: 40px;
          }

          .footer-section {
            text-align: center;
          }

          .footer-title::after {
            left: 50%;
            transform: translateX(-50%);
          }

          .disclaimer-content {
            font-size: 11px;
          }
        }

        /* Small Mobile Styles */
        @media (max-width: 576px) {
          .footer-main {
            padding: 30px 0;
            gap: 30px;
          }

          .footer-sections {
            gap: 30px;
          }

          .footer-logo {
            width: 100px;
          }

          .disclaimer-content {
            font-size: 10px;
            line-height: 1.5;
          }

          .disclaimer-content p {
            margin-bottom: 12px;
          }
        }
`}</style>
    </footer>
  );
}

export default Footer;