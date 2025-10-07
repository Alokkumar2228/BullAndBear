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

  const menuItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Orders", path: "/dashboard/orders" },
    { name: "Holdings", path: "/dashboard/holdings" },
    { name: "Positions", path: "/dashboard/positions" },
    { name: "Funds", path: "/dashboard/funds" },
    { name: "Apps", path: "/dashboard/apps" },
  ];

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
        marginTop:"-2px",
        // height:"30px",
      
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
            gap: "40px",
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
              position: "absolute",
              right: "0",
              top: "50px",
              backgroundColor: "#fff",
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "10px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              zIndex: 10,
            }}
          >
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
                transition:
                  "background-color 0.2s ease, transform 0.1s ease",
              }}
              onMouseEnter={(e) =>
                (e.target.style.backgroundColor = "#d32f2f")
              }
              onMouseLeave={(e) =>
                (e.target.style.backgroundColor = "#f44336")
              }
              onMouseDown={(e) =>
                (e.target.style.transform = "scale(0.96)")
              }
              onMouseUp={(e) =>
                (e.target.style.transform = "scale(1)")
              }
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
  );
};

export default Menu;
