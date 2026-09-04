import React, { useState, useRef, useEffect } from "react";
import { Send, Smile, Paperclip, X } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useChatStore } from "../../store/useChatStore";
import { useSocketStore } from "../../store/useSocketStore";

const POPULAR_EMOJIS = [
  "😀", "😂", "🔥", "❤️", "👍", "🎉", "🙌", "😍",
  "😎", "✨", "💯", "🚀", "🤔", "👏", "🥳", "🙏"
];

export const MessageInput = () => {
  const { user } = useAuthStore();
  const { selectedChat, sendMessage, isSendingMessage } = useChatStore();
  const { emitSendMessage, emitTyping, emitStopTyping } = useSocketStore();

  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  const chatId = selectedChat?._id;

  // Handle typing status
  const handleTextChange = (e) => {
    const val = e.target.value;
    setText(val);

    if (!chatId) return;

    if (val.trim().length > 0) {
      emitTyping(chatId, user?.name);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        emitStopTyping(chatId);
      }, 2000);
    } else {
      emitStopTyping(chatId);
    }
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!text.trim() || isSendingMessage) return;

    const messageContent = text.trim();
    setText("");
    setShowEmojiPicker(false);

    // Stop typing immediately
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    emitStopTyping(chatId);

    // Send via API
    const sentMsg = await sendMessage(messageContent);
    if (sentMsg) {
      // Emit via socket to real-time engine
      emitSendMessage(sentMsg);
    }

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAddEmoji = (emoji) => {
    setText((prev) => prev + emoji);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Close emoji picker if user clicks outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showEmojiPicker && !e.target.closest(".emoji-picker-container")) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker]);

  return (
    <div
      style={{
        padding: "14px 20px",
        backgroundColor: "var(--bg-surface)",
        backdropFilter: "blur(12px)",
        borderTop: "1px solid var(--border-color)",
        position: "relative",
      }}
    >
      {/* Emoji Picker Popup */}
      {showEmojiPicker && (
        <div
          className="emoji-picker-container glass-panel animate-pop-in"
          style={{
            position: "absolute",
            bottom: "80px",
            left: "20px",
            padding: "12px",
            zIndex: 50,
            width: "280px",
            display: "grid",
            gridTemplateColumns: "repeat(8, 1fr)",
            gap: "8px",
            backgroundColor: "var(--bg-secondary)",
          }}
        >
          {POPULAR_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleAddEmoji(emoji)}
              style={{
                background: "transparent",
                border: "none",
                fontSize: "1.3rem",
                cursor: "pointer",
                padding: "4px",
                borderRadius: "var(--radius-sm)",
                transition: "transform 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.25)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={handleSend}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <button
          type="button"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className="btn-icon emoji-picker-container"
          title="Add Emoji"
          aria-label="Add Emoji"
          style={{
            color: showEmojiPicker ? "var(--accent-primary)" : "var(--text-secondary)",
          }}
        >
          <Smile size={20} />
        </button>

        <div style={{ flex: 1, position: "relative" }}>
          <input
            ref={inputRef}
            type="text"
            className="input-field"
            placeholder="Type your message..."
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            disabled={isSendingMessage}
            style={{
              padding: "12px 18px",
              borderRadius: "var(--radius-full)",
              fontSize: "0.95rem",
            }}
          />
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={!text.trim() || isSendingMessage}
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "var(--radius-full)",
            padding: 0,
            flexShrink: 0,
          }}
          title="Send Message"
          aria-label="Send Message"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
