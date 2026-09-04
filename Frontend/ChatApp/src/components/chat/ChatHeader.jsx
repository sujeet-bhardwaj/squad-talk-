import React, { useState } from "react";
import { ArrowLeft, Phone, Video, MoreVertical, ShieldCheck, UserCheck } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useChatStore } from "../../store/useChatStore";
import Avatar from "../common/Avatar";

export const ChatHeader = ({ onBackMobile }) => {
  const { user } = useAuthStore();
  const { selectedChat, onlineUsers, typingUsers } = useChatStore();
  const [callNotice, setCallNotice] = useState(null);

  if (!selectedChat) return null;

  // Find other participant
  const otherUser = selectedChat.isGroupChat
    ? {
        name: selectedChat.chatName,
        profilePicture: selectedChat.groupAvatar,
        isOnline: false,
        isGroup: true,
      }
    : selectedChat.users?.find(
        (u) => (u._id || u).toString() !== (user._id || user.id).toString()
      ) || { name: "Chat User" };

  const isOtherOnline = otherUser._id
    ? onlineUsers.includes(otherUser._id.toString())
    : false;

  const currentTypers = typingUsers[selectedChat._id] || [];
  const isTyping = currentTypers.length > 0;

  const triggerCallNotice = (type) => {
    setCallNotice(`Starting ${type} with ${otherUser.name}...`);
    setTimeout(() => setCallNotice(null), 3000);
  };

  return (
    <header
      style={{
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid var(--border-color)",
        backgroundColor: "var(--bg-surface)",
        backdropFilter: "blur(12px)",
        position: "relative",
        zIndex: 10,
      }}
    >
      {/* Toast Notice for actions */}
      {callNotice && (
        <div
          className="animate-pop-in"
          style={{
            position: "absolute",
            top: "70px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "var(--bg-secondary)",
            color: "var(--text-primary)",
            padding: "8px 16px",
            borderRadius: "var(--radius-full)",
            border: "1px solid var(--accent-primary)",
            boxShadow: "var(--shadow-glow)",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            zIndex: 100,
          }}
        >
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent-primary)" }} />
          {callNotice}
        </div>
      )}

      {/* Left: Mobile Back + User details */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
        {onBackMobile && (
          <button
            onClick={onBackMobile}
            className="btn-icon"
            style={{ width: "36px", height: "36px" }}
            aria-label="Back to chats"
          >
            <ArrowLeft size={18} />
          </button>
        )}

        <Avatar
          src={otherUser.profilePicture}
          name={otherUser.name}
          size="md"
          showStatus={!selectedChat.isGroupChat}
          isOnline={isOtherOnline}
        />

        <div style={{ minWidth: 0 }}>
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: "700",
              color: "var(--text-primary)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {otherUser.name}
          </h3>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {isTyping ? (
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "var(--accent-primary)",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                typing
                <span className="typing-dot" style={{ width: "4px", height: "4px" }} />
                <span className="typing-dot" style={{ width: "4px", height: "4px" }} />
                <span className="typing-dot" style={{ width: "4px", height: "4px" }} />
              </span>
            ) : isOtherOnline ? (
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "var(--online-color)",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "var(--online-color)",
                  }}
                />
                Active Now
              </span>
            ) : (
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Offline
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <button
          onClick={() => triggerCallNotice("Audio Call")}
          className="btn-icon"
          title="Voice Call"
          aria-label="Voice Call"
        >
          <Phone size={18} />
        </button>
        <button
          onClick={() => triggerCallNotice("Video Call")}
          className="btn-icon"
          title="Video Call"
          aria-label="Video Call"
        >
          <Video size={18} />
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;
