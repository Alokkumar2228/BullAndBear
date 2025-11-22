import React, { useState, useEffect, useRef, useMemo } from "react";
import assets from "@/assets";
import { useClerk, useUser } from "@clerk/clerk-react"; // <-- add useUser
import { Link, useNavigate, useLocation } from "react-router-dom";
import ProfilePopup from "./ProfilePopup"; // <-- import new component

const Menu = () => {
  const [selectedMenu, setSelectedMenu] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  // const user = localStorage.getItem("user_name"); <-- remove localStorage lookup
  const { signOut } = useClerk();
  const { user } = useUser(); // <-- get user from Clerk
  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef(null);

  const handleMenuClick = (index) => {
    setSelectedMenu(index);
  };

  const handleUserfileClick = () => {
    setShowDropdown((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Sign out failed:", err);
    } finally {
      setShowDropdown(false);
      navigate("/auth");
    }
  };

  function getInitialsFromName(name) {
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
  const menuItems = useMemo(
    () => [
      { name: "Dashboard", path: "/dashboard" },
      { name: "Orders", path: "/dashboard/orders" },
      { name: "Holdings", path: "/dashboard/holdings" },
      { name: "Positions", path: "/dashboard/positions" },
      { name: "Funds", path: "/dashboard/funds" },
    ],
    []
  );

  // Sync active menu with current URL
  useEffect(() => {
    const index = menuItems.findIndex((item) => item.path === location.pathname);
    if (index !== -1) setSelectedMenu(index);
  }, [location.pathname, menuItems]);

  // Close dropdown when clicking outside the profile area
  useEffect(() => {
    function handleDocumentClick(e) {
      if (
        showDropdown &&
        profileRef.current &&
        !profileRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleDocumentClick);
    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, [showDropdown]);

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
        ref={profileRef}
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
          {user?.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt="avatar"
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : (
            getInitialsFromName(
              user?.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`
            )
          )}
        </div>

        {showDropdown && (
          <div
            style={{
              position: "fixed",
              right: "30px",
              top: "60px",
              zIndex: 999999,
            }}
          >
            <ProfilePopup
              onClose={() => setShowDropdown(false)}
              onLogout={handleLogout}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;