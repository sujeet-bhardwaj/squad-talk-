import React from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Home, AlertCircle } from "lucide-react";
import ThemeToggle from "../components/common/ThemeToggle";

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        backgroundColor: "var(--bg-primary)",
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", top: "24px", right: "24px" }}>
        <ThemeToggle />
      </div>

      <div
        className="glass-panel animate-pop-in"
        style={{
          maxWidth: "460px",
          width: "100%",
          padding: "40px 32px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--danger-color)",
          }}
        >
          <AlertCircle size={32} />
        </div>

        <h1
          style={{
            fontSize: "3.5rem",
            fontWeight: "900",
            letterSpacing: "-0.04em",
            background: "var(--accent-gradient)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: 0,
            lineHeight: 1,
          }}
        >
          404
        </h1>

        <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--text-primary)" }}>
          Page Not Found
        </h2>

        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
          The page or conversation you are looking for doesn't exist or has moved.
        </p>

        <button
          onClick={() => navigate("/chat")}
          className="btn-primary"
          style={{ marginTop: "12px", width: "100%", padding: "12px 20px" }}
        >
          <Home size={18} />
          <span>Back to Messages</span>
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
