import React from "react";
import { API_BASE_URL } from "../../api/axiosClient";

export const Avatar = ({
  src,
  name = "User",
  size = "md",
  isOnline = false,
  showStatus = false,
  className = "",
  onClick,
}) => {
  const sizeMap = {
    xs: { dim: "28px", fontSize: "0.75rem", badge: "8px" },
    sm: { dim: "36px", fontSize: "0.85rem", badge: "9px" },
    md: { dim: "46px", fontSize: "1rem", badge: "12px" },
    lg: { dim: "60px", fontSize: "1.25rem", badge: "14px" },
    xl: { dim: "90px", fontSize: "1.75rem", badge: "18px" },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // Resolve image URL
  const getFullImageUrl = (imageSrc) => {
    if (!imageSrc) return null;
    if (imageSrc.startsWith("http://") || imageSrc.startsWith("https://") || imageSrc.startsWith("blob:")) {
      return imageSrc;
    }
    return `${API_BASE_URL}${imageSrc.startsWith("/") ? "" : "/"}${imageSrc}`;
  };

  const resolvedSrc = getFullImageUrl(src);
  const fallbackInitial = name ? name.charAt(0).toUpperCase() : "?";

  return (
    <div
      onClick={onClick}
      style={{
        position: "relative",
        width: currentSize.dim,
        height: currentSize.dim,
        flexShrink: 0,
        cursor: onClick ? "pointer" : "default",
      }}
      className={className}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          overflow: "hidden",
          background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          fontWeight: "700",
          fontSize: currentSize.fontSize,
          boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
          border: "2px solid rgba(255, 255, 255, 0.15)",
        }}
      >
        {resolvedSrc ? (
          <img
            src={resolvedSrc}
            alt={name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <span>{fallbackInitial}</span>
        )}
      </div>

      {showStatus && (
        <span
          className={isOnline ? "online-ping" : ""}
          style={{
            position: "absolute",
            bottom: "0",
            right: "0",
            width: currentSize.badge,
            height: currentSize.badge,
            borderRadius: "50%",
            backgroundColor: isOnline ? "var(--online-color, #10b981)" : "var(--offline-color, #64748b)",
            border: "2px solid var(--bg-secondary, #111827)",
          }}
          title={isOnline ? "Online" : "Offline"}
        />
      )}
    </div>
  );
};

export default Avatar;
