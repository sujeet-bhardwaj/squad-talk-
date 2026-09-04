import React from "react";
import { MessageSquare, Sparkles, Shield, Zap } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";

export const EmptyChatState = () => {
  const { user } = useAuthStore();

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        background: "var(--bg-primary)",
        textAlign: "center",
      }}
    >
      <div
        className="glass-panel animate-pop-in"
        style={{
          maxWidth: "440px",
          padding: "40px 32px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "18px",
        }}
      >
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "var(--accent-gradient)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            boxShadow: "var(--shadow-glow)",
          }}
        >
          <MessageSquare size={36} />
        </div>

        <div>
          <h2
            style={{
              fontSize: "1.4rem",
              fontWeight: "800",
              color: "var(--text-primary)",
              marginBottom: "8px",
            }}
          >
            Welcome, {user?.name || "Friend"}! 👋
          </h2>
          <p
            style={{
              fontSize: "0.92rem",
              color: "var(--text-secondary)",
              lineHeight: "1.5",
            }}
          >
            Select a contact from the sidebar or search for users to start an end-to-end real-time conversation.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            width: "100%",
            marginTop: "10px",
          }}
        >
          <div
            style={{
              padding: "12px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-color)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.8rem",
              color: "var(--text-secondary)",
              textAlign: "left",
            }}
          >
            <Zap size={16} style={{ color: "var(--accent-primary)", flexShrink: 0 }} />
            <span>Instant delivery with Socket.io</span>
          </div>

          <div
            style={{
              padding: "12px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-color)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.8rem",
              color: "var(--text-secondary)",
              textAlign: "left",
            }}
          >
            <Shield size={16} style={{ color: "#10b981", flexShrink: 0 }} />
            <span>Secure JWT authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyChatState;
