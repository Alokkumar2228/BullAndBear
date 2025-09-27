import React, { useState, useEffect } from "react";
import assets from "@/assets";
import { Link } from "react-router-dom";

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: "Signup", to: "/auth", isButton: true },
    { name: "About", to: "/about" },
    { name: "Products", to: "/products" },
    { name: "Pricing", to: "/pricing" },
    { name: "Support", to: "/support" },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <nav
        className={`navbar navbar-expand-lg fixed-top transition-all ${
          isScrolled ? 'navbar-scrolled' : ''
        }`}
        style={{
          backgroundColor: "#fff",
          borderBottom: isScrolled ? "1px solid rgba(0,0,0,0.1)" : "1px solid #eee",
          boxShadow: isScrolled ? "0 2px 20px rgba(0,0,0,0.1)" : "none",
          transition: "all 0.3s ease",
          zIndex: 1030
        }}
      >
        <div className="container">
          {/* Brand Logo */}
          <Link className="navbar-brand py-2" to="/" style={{ transition: "transform 0.2s ease" }}>
            <img
              src={assets.logos.main}
              alt="Bull&Bear Logo"
              className="navbar-logo"
              style={{
                height: isScrolled ? "40px" : "50px",
                width: "auto",
                transition: "height 0.3s ease"
              }}
            />
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            className="navbar-toggler border-0 p-2"
            type="button"
            onClick={toggleMobileMenu}
            aria-controls="navbarSupportedContent"
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle navigation"
            style={{
              boxShadow: "none",
              outline: "none"
            }}
            onFocus={(e) => e.target.blur()}
          >
            <span className={`hamburger-icon ${isMobileMenuOpen ? 'active' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>

          {/* Navigation Menu */}
          <div
            className={`collapse navbar-collapse ${isMobileMenuOpen ? 'show' : ''}`}
            id="navbarSupportedContent"
          >
            <ul className="navbar-nav ms-auto align-items-center">
              {navItems.map((item, index) => (
                <li key={index} className="nav-item mx-1">
                  {item.isButton ? (
                    <Link
                      className="nav-link signup-btn"
                      to={item.to}
                      style={{
                        backgroundColor: "#387ed1",
                        color: "white",
                        padding: "8px 24px",
                        borderRadius: "4px",
                        fontWeight: "500",
                        transition: "all 0.3s ease",
                        border: "2px solid #387ed1",
                        textDecoration: "none"
                      }}
                      onFocus={(e) => e.target.blur()}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = "transparent";
                        e.target.style.color = "#387ed1";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = "#387ed1";
                        e.target.style.color = "white";
                      }}
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <Link
                      className="nav-link"
                      to={item.to}
                      style={{
                        color: "#666",
                        fontWeight: "500",
                        padding: "8px 16px",
                        position: "relative",
                        transition: "color 0.3s ease",
                        textDecoration: "none"
                      }}
                      onFocus={(e) => e.target.blur()}
                      onMouseOver={(e) => {
                        e.target.style.color = "#387ed1";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.color = "#666";
                      }}
                    >
                      {item.name}
                      <span className="nav-underline"></span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content from hiding under fixed navbar */}
      <div style={{ height: "70px" }}></div>

      {/* Custom CSS */}
      <style>{`
        .navbar {
          backdrop-filter: blur(10px);
        }
        
        .navbar-brand:hover {
          transform: scale(1.05);
        }

        .nav-link {
          position: relative;
          overflow: hidden;
        }

        .nav-link:not(.signup-btn)::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 2px;
          background-color: #387ed1;
          transition: all 0.3s ease;
          transform: translateX(-50%);
        }

        .nav-link:not(.signup-btn):hover::after {
          width: 80%;
        }

        /* Hamburger Animation */
        .hamburger-icon {
          display: flex;
          flex-direction: column;
          width: 24px;
          height: 18px;
          position: relative;
          cursor: pointer;
        }

        .hamburger-icon span {
          width: 100%;
          height: 2px;
          background-color: #333;
          border-radius: 2px;
          transition: all 0.3s ease;
          transform-origin: center;
        }

        .hamburger-icon span:nth-child(1) {
          margin-bottom: 6px;
        }

        .hamburger-icon span:nth-child(2) {
          margin-bottom: 6px;
        }

        .hamburger-icon.active span:nth-child(1) {
          transform: rotate(45deg) translateY(8px);
        }

        .hamburger-icon.active span:nth-child(2) {
          opacity: 0;
        }

        .hamburger-icon.active span:nth-child(3) {
          transform: rotate(-45deg) translateY(-8px);
        }

        /* Mobile Styles */
        @media (max-width: 991.98px) {
          .navbar-collapse {
            background-color: white;
            border-radius: 8px;
            margin-top: 16px;
            padding: 20px;
            box-shadow: 0 5px 25px rgba(0,0,0,0.1);
            border: 1px solid #eee;
          }

          .navbar-nav {
            text-align: center;
          }

          .nav-item {
            margin: 8px 0;
          }

          .nav-link:not(.signup-btn) {
            padding: 12px 20px;
            border-radius: 6px;
            transition: all 0.3s ease;
          }

          .nav-link:not(.signup-btn):hover {
            background-color: #f8f9fa;
            color: #387ed1;
          }

          .signup-btn {
            margin-top: 16px;
            display: inline-block;
            text-align: center;
            min-width: 120px;
          }
        }

        /* Smooth scrolling */
        @media (min-width: 992px) {
          .navbar-nav {
            gap: 8px;
          }
        }

        /* Logo hover effect */
        .navbar-logo:hover {
          filter: brightness(1.1);
        }

        /* Enhanced mobile menu animation */
        .navbar-collapse {
          transition: all 0.3s ease;
        }

        @media (max-width: 991.98px) {
          .navbar-collapse.show {
            animation: slideDown 0.3s ease;
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Focus states for accessibility - Remove outline box */
        .nav-link:focus,
        .navbar-brand:focus {
          outline: none;
          box-shadow: none;
      //   }
        
      //   .nav-link:focus-visible,
      //   .navbar-brand:focus-visible {
      //     outline: none;
      //     box-shadow: none;
      //   }

      //   /* Active state */
      //   .nav-link.active:not(.signup-btn) {
      //     color: #387ed1;
      //     font-weight: 600;
      //   }
      // `}</style>
    </>
  );
}

export default Navbar;