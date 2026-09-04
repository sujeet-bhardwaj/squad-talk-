import React, { useEffect, useRef } from "react";
import { Check, CheckCheck } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useChatStore } from "../../store/useChatStore";
import { useSocketStore } from "../../store/useSocketStore";
import Avatar from "../common/Avatar";

export const MessageArea = () => {
  const { user } = useAuthStore();
  const {
    selectedChat,
    messages,
    isLoadingMessages,
    typingUsers,
    markChatAsRead,
  } = useChatStore();

  const { emitMessageSeen, joinChat, leaveChat } = useSocketStore();
  const messagesEndRef = useRef(null);
  const currentChatId = selectedChat?._id;

  // Join chat room on select, emit seen
  useEffect(() => {
    if (currentChatId) {
      joinChat(currentChatId);
      markChatAsRead(currentChatId);

      const unreadMessageIds = messages
        .filter(
          (m) =>
            (m.sender._id || m.sender).toString() !== (user._id || user.id).toString()
        )
        .map((m) => m._id);

      if (unreadMessageIds.length > 0) {
        emitMessageSeen(currentChatId, unreadMessageIds);
      }

      return () => {
        leaveChat(currentChatId);
      };
    }
  }, [currentChatId, joinChat, leaveChat, markChatAsRead, emitMessageSeen, user]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  const currentTypers = currentChatId ? typingUsers[currentChatId] || [] : [];
  const isOtherTyping = currentTypers.length > 0;

  const formatTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        background: "var(--bg-primary)",
      }}
    >
      {isLoadingMessages ? (
        <div
          style={{
            margin: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
            color: "var(--text-muted)",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              border: "3px solid var(--border-color)",
              borderTopColor: "var(--accent-primary)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <span style={{ fontSize: "0.85rem" }}>Loading conversation...</span>
        </div>
      ) : messages.length === 0 ? (
        <div
          style={{
            margin: "auto",
            textAlign: "center",
            maxWidth: "340px",
            padding: "24px",
            borderRadius: "var(--radius-lg)",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-color)",
          }}
        >
          <h4
            style={{
              fontSize: "1rem",
              fontWeight: "700",
              color: "var(--text-primary)",
              marginBottom: "6px",
            }}
          >
            Say Hello! 👋
          </h4>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.4" }}>
            This is the start of your message history. Type below to send your first message!
          </p>
        </div>
      ) : (
        messages.map((msg, index) => {
          const senderId = (msg.sender?._id || msg.sender)?.toString();
          const currentUserId = (user?._id || user?.id)?.toString();
          const isMe = senderId === currentUserId;

          // Read status: if readBy array contains more than 1 user (sender + receiver)
          const isRead = msg.readBy && msg.readBy.length > 1;

          return (
            <div
              key={msg._id || index}
              className="animate-pop-in"
              style={{
                display: "flex",
                justifyContent: isMe ? "flex-end" : "flex-start",
                alignItems: "flex-end",
                gap: "8px",
              }}
            >
              {!isMe && (
                <Avatar
                  src={msg.sender?.profilePicture}
                  name={msg.sender?.name}
                  size="xs"
                />
              )}

              <div
                style={{
                  maxWidth: "70%",
                  padding: "10px 16px",
                  borderRadius: isMe
                    ? "18px 18px 4px 18px"
                    : "18px 18px 18px 4px",
                  background: isMe
                    ? "var(--bubble-sent)"
                    : "var(--bubble-received)",
                  color: isMe
                    ? "var(--bubble-sent-text)"
                    : "var(--bubble-received-text)",
                  boxShadow: isMe ? "var(--shadow-glow)" : "var(--shadow-sm)",
                  border: isMe
                    ? "none"
                    : "1px solid var(--border-color)",
                  position: "relative",
                  wordBreak: "break-word",
                }}
              >
                {/* Message Text */}
                <p
                  style={{
                    fontSize: "0.93rem",
                    lineHeight: "1.45",
                    margin: 0,
                    fontWeight: "400",
                  }}
                >
                  {msg.content}
                </p>

                {/* Footer: Timestamp & Read Status */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: "4px",
                    marginTop: "4px",
                    fontSize: "0.7rem",
                    opacity: 0.8,
                  }}
                >
                  <span>{formatTime(msg.createdAt)}</span>

                  {isMe && (
                    <span title={isRead ? "Read" : "Sent"}>
                      {isRead ? (
                        <CheckCheck size={14} style={{ color: "#38bdf8" }} />
                      ) : (
                        <Check size={14} />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* Real-time Typing Bubble */}
      {isOtherTyping && (
        <div
          className="animate-pop-in"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            alignSelf: "flex-start",
          }}
        >
          <div
            style={{
              padding: "8px 14px",
              borderRadius: "18px 18px 18px 4px",
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-color)",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageArea;
