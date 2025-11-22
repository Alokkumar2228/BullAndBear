import React from "react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { Link, useNavigate } from "react-router-dom";

const ProfilePopup = ({ onClose }) => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    localStorage.removeItem("user_name"); // remove if you no longer use it
    navigate("/auth");
    onClose?.();
  };

  const displayName = user?.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
  const email = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || "";

  return (
    <div
      style={{
        minWidth: 220,
        background: "#fff",
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: 12,
        boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
        <img
          src={user?.profileImageUrl || user?.imageUrl || ""}
          alt="avatar"
          style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", background: "#eee" }}
        />
        <div>
          <div style={{ fontWeight: 600 }}>{displayName || "No name"}</div>
          <div style={{ fontSize: 12, color: "#666" }}>{email}</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

        <button
          onClick={handleSignOut}
          style={{
            padding: "8px 10px",
            border: "none",
            background: "transparent",
            color: "#d9534f",
            textAlign: "left",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
};

export default ProfilePopup;