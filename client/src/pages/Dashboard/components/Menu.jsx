import React, { useState } from "react";
import assets from "@/assets";
import { useClerk } from "@clerk/clerk-react";

import { Link, useNavigate } from "react-router-dom";
import "./dashboard.css";

const Menu = () => {
  const [selectedMenu, setSelectedMenu] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  const user = localStorage.getItem("user_name");

  const navigate = useNavigate();
  const { signOut } = useClerk();

  const handleUserfileClick = () => {
    setShowDropdown((prev) => !prev);
  };

  const handleMenuClick = (index) => {
    setSelectedMenu(index);
  };

  const handleLogout = async () => {
    await signOut();
    localStorage.removeItem("user_name");
    navigate("/auth");
  };

  const menuClass = "menu";
  const activeMenuClass = "menu selected";

  function getInitials(name) {
    if (!name) return "";

    const words = name.trim().split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    } else if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    } else {
      return "";
    }
  }

  return (
    <div className="menu-container">
      <div className="img-log">
        <img src={assets.logos.main} style={{ width: "50px" }} />
      </div>
      <div className="menus">
        <ul>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/dashboard"
              onClick={() => handleMenuClick(0)}
            >
              <p className={selectedMenu === 0 ? activeMenuClass : menuClass}>
                Dashboard
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/dashboard/orders"
              onClick={() => handleMenuClick(1)}
            >
              <p className={selectedMenu === 1 ? activeMenuClass : menuClass}>
                Orders
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/dashboard/holdings"
              onClick={() => handleMenuClick(2)}
            >
              <p className={selectedMenu === 2 ? activeMenuClass : menuClass}>
                Holdings
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/dashboard/positions"
              onClick={() => handleMenuClick(3)}
            >
              <p className={selectedMenu === 3 ? activeMenuClass : menuClass}>
                Positions
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/dashboard/funds"
              onClick={() => handleMenuClick(4)}
            >
              <p className={selectedMenu === 4 ? activeMenuClass : menuClass}>
                Funds
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/dashboard/apps"
              onClick={() => handleMenuClick(6)}
            >
              <p className={selectedMenu === 6 ? activeMenuClass : menuClass}>
                Apps
              </p>
            </Link>
          </li>
        </ul>
        <hr />
        <div className="profile" onClick={handleUserfileClick}>
          <div className="avatar">{getInitials(user)}</div>
          {showDropdown && (
            <div className="dropdown">
              <button
                onClick={handleLogout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 16px",
                  backgroundColor: "#f44336",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "background-color 0.2s ease, transform 0.1s ease",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#d32f2f")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "#f44336")
                }
                onMouseDown={(e) => (e.target.style.transform = "scale(0.96)")}
                onMouseUp={(e) => (e.target.style.transform = "scale(1)")}
              >
                <i
                  className="fa-solid fa-right-from-bracket"
                  style={{ fontSize: "16px" }}
                ></i>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Menu;
