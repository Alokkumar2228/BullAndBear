import React, { useState, useEffect } from "react";
import assets from "@/assets";
import { useClerk } from "@clerk/clerk-react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Menu = () => {
  const [selectedMenu, setSelectedMenu] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  const user = localStorage.getItem("user_name");
  const navigate = useNavigate();
  const location = useLocation();
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

  // For menu active highlight on refresh
  const menuItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Orders", path: "/dashboard/orders" },
    { name: "Holdings", path: "/dashboard/holdings" },
    { name: "Positions", path: "/dashboard/positions" },
    { name: "Funds", path: "/dashboard/funds" },
  ];

  // Sync active menu with current URL
  useEffect(() => {
    const index = menuItems.findIndex((item) => item.path === location.pathname);
    if (index !== -1) setSelectedMenu(index);
  }, [location.pathname]);

  return (
    <div
      className="menu-container"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 30px",
        borderBottom: "1px solid #eee",
        backgroundColor: "#fff",
        marginTop: "-2px",
      }}
    >
      {/* Logo */}
      <div className="img-log">
        <img src={assets.logos.main} style={{ width: "50px" }} alt="logo" />
      </div>

      {/* Menu Items */}
      <div className="menus">
        <ul
          style={{
            display: "flex",
            gap: "60px",
            listStyle: "none",
            margin: 0,
            padding: 0,
            alignItems: "center",
          }}
        >
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                onClick={() => handleMenuClick(index)}
                style={{
                  textDecoration: "none",
                  color: selectedMenu === index ? "#000" : "#555",
                  fontWeight: selectedMenu === index ? "600" : "400",
                  paddingBottom: "6px",
                  borderBottom:
                    selectedMenu === index
                      ? "2px solid #387ed1"
                      : "2px solid transparent",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.borderBottom = "2px solid #387ed1")
                }
                onMouseLeave={(e) =>
                  (e.target.style.borderBottom =
                    selectedMenu === index
                      ? "2px solid #387ed1"
                      : "2px solid transparent")
                }
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Profile */}
      <div
        className="profile"
        onClick={handleUserfileClick}
        style={{ cursor: "pointer", position: "relative" }}
      >
        <div
          className="avatar"
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            backgroundColor: "#387ed1",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "600",
          }}
        >
          {getInitials(user)}
        </div>

        {showDropdown && (
          <div
            className="dropdown"
            style={{
              position: "fixed",
              right: "30px",
              top: "60px",
              backgroundColor: "#fff",
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "5px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              zIndex: 999999,
            }}
          >
            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 14px",
                backgroundColor: "transparent",
                color: "black",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              <i
                className="fa-solid fa-right-from-bracket"
                style={{ fontSize: "16px", color: "red" }}
              ></i>
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
