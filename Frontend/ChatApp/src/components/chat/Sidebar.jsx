import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  LogOut,
  User as UserIcon,
  MessageSquarePlus,
  X,
  Check,
  CheckCheck,
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useChatStore } from "../../store/useChatStore";
import { useSocketStore } from "../../store/useSocketStore";
import Avatar from "../common/Avatar";
import ThemeToggle from "../common/ThemeToggle";

export const Sidebar = ({ onSelectChatMobile }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const {
    chats,
    selectedChat,
    setSelectedChat,
    fetchChats,
    onlineUsers,
    unreadCounts,
    searchResults,
    searchUsers,
    isSearching,
    startChatWithUser,
  } = useChatStore();

  const { disconnectSocket } = useSocketStore();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, searchUsers]);

  const handleLogout = () => {
    disconnectSocket();
    logout();
    navigate("/auth");
  };

  // Helper to extract the other participant in 1-on-1 chat
  const getChatRecipient = (chat) => {
    if (!chat || !chat.users || !user) return { name: "User", isOnline: false };
    if (chat.isGroupChat) {
      return {
        name: chat.chatName,
        profilePicture: chat.groupAvatar,
        isOnline: false,
        isGroup: true,
      };
    }
    const other = chat.users.find(
      (u) => (u._id || u).toString() !== (user._id || user.id).toString()
    );
    if (!other) return { name: "Direct Chat", isOnline: false };

    const isUserOnline = onlineUsers.includes(other._id?.toString() || other.toString());
    return {
      ...other,
      isOnline: isUserOnline,
    };
  };

  const formatMessageTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const handleStartChat = async (targetUserId) => {
    const chat = await startChatWithUser(targetUserId);
    setSearchTerm("");
    if (onSelectChatMobile) onSelectChatMobile();
  };

  const handleSelectConversation = (chat) => {
    setSelectedChat(chat);
    if (onSelectChatMobile) onSelectChatMobile();
  };

  return (
    <aside
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--bg-secondary)",
        borderRight: "1px solid var(--border-color)",
        overflow: "hidden",
      }}
    >
      {/* User Header Profile */}
      <div
        style={{
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--border-color)",
          backgroundColor: "var(--bg-surface)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          onClick={() => navigate("/profile")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            cursor: "pointer",
            flex: 1,
            minWidth: 0,
          }}
          title="View & Edit Profile"
        >
          <Avatar
            src={user?.profilePicture}
            name={user?.name}
            size="md"
            showStatus={true}
            isOnline={true}
          />
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3
              style={{
                fontSize: "0.95rem",
                fontWeight: "700",
                color: "var(--text-primary)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.name || "My Account"}
            </h3>
            <p
              style={{
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.statusMessage || "Online"}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <ThemeToggle />
          <button
            onClick={() => navigate("/profile")}
            className="btn-icon"
            title="Profile Settings"
            aria-label="Profile Settings"
          >
            <UserIcon size={18} />
          </button>
          <button
            onClick={handleLogout}
            className="btn-icon"
            style={{ color: "var(--danger-color)" }}
            title="Log Out"
            aria-label="Log Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ padding: "14px 16px 8px 16px" }}>
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Search
            size={18}
            style={{
              position: "absolute",
              left: "14px",
              color: "var(--text-muted)",
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            className="input-field"
            placeholder="Search users or chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: "42px", paddingRight: searchTerm ? "36px" : "16px" }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              style={{
                position: "absolute",
                right: "12px",
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Search Results Dropdown/Panel */}
      {searchTerm.trim().length > 0 && (
        <div
          style={{
            padding: "8px 16px",
            borderBottom: "1px solid var(--border-color)",
            maxHeight: "220px",
            overflowY: "auto",
            backgroundColor: "var(--bg-tertiary)",
          }}
        >
          <div
            style={{
              fontSize: "0.75rem",
              fontWeight: "700",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "8px",
            }}
          >
            Search Results {isSearching && "..."}
          </div>

          {searchResults.length === 0 && !isSearching ? (
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", padding: "8px 0" }}>
              No users found matching "{searchTerm}"
            </p>
          ) : (
            searchResults.map((foundUser) => {
              const isFoundUserOnline = onlineUsers.includes(foundUser._id.toString());
              return (
                <div
                  key={foundUser._id}
                  onClick={() => handleStartChat(foundUser._id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 10px",
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                    transition: "var(--transition-smooth)",
                    marginBottom: "4px",
                    backgroundColor: "var(--bg-surface)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-surface-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-surface)")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Avatar
                      src={foundUser.profilePicture}
                      name={foundUser.name}
                      size="sm"
                      showStatus={true}
                      isOnline={isFoundUserOnline}
                    />
                    <div>
                      <div style={{ fontSize: "0.88rem", fontWeight: "600", color: "var(--text-primary)" }}>
                        {foundUser.name}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {foundUser.email}
                      </div>
                    </div>
                  </div>
                  <MessageSquarePlus size={18} style={{ color: "var(--accent-primary)" }} />
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Conversations List */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "8px 12px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <div
          style={{
            fontSize: "0.75rem",
            fontWeight: "700",
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            padding: "8px 8px 4px 8px",
          }}
        >
          Recent Messages
        </div>

        {chats.length === 0 ? (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              color: "var(--text-muted)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "var(--bg-tertiary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-primary)",
              }}
            >
              <MessageSquarePlus size={28} />
            </div>
            <p style={{ fontSize: "0.9rem", fontWeight: "500" }}>No conversations yet</p>
            <p style={{ fontSize: "0.8rem", lineHeight: "1.4" }}>
              Search for users by name or email above to initiate your first chat!
            </p>
          </div>
        ) : (
          chats.map((chat) => {
            const recipient = getChatRecipient(chat);
            const isSelected = selectedChat?._id === chat._id;
            const unread = unreadCounts[chat._id] || 0;
            const latestMsg = chat.latestMessage;

            return (
              <div
                key={chat._id}
                onClick={() => handleSelectConversation(chat)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 14px",
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                  transition: "var(--transition-smooth)",
                  backgroundColor: isSelected ? "var(--bg-surface-hover)" : "transparent",
                  border: isSelected
                    ? "1px solid var(--border-focus)"
                    : "1px solid transparent",
                  boxShadow: isSelected ? "var(--shadow-sm)" : "none",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = "var(--bg-surface)";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {/* Selection Indicator Line */}
                {isSelected && (
                  <div
                    style={{
                      position: "absolute",
                      left: "0",
                      top: "20%",
                      bottom: "20%",
                      width: "4px",
                      borderRadius: "0 4px 4px 0",
                      background: "var(--accent-gradient)",
                    }}
                  />
                )}

                <Avatar
                  src={recipient.profilePicture}
                  name={recipient.name}
                  size="md"
                  showStatus={true}
                  isOnline={recipient.isOnline}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      marginBottom: "4px",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: "0.92rem",
                        fontWeight: unread > 0 ? "700" : "600",
                        color: "var(--text-primary)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {recipient.name}
                    </h4>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        color: unread > 0 ? "var(--accent-primary)" : "var(--text-muted)",
                        fontWeight: unread > 0 ? "600" : "400",
                        marginLeft: "8px",
                      }}
                    >
                      {formatMessageTime(latestMsg?.createdAt || chat.updatedAt)}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "0.82rem",
                        color: unread > 0 ? "var(--text-primary)" : "var(--text-muted)",
                        fontWeight: unread > 0 ? "600" : "400",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "180px",
                      }}
                    >
                      {latestMsg ? latestMsg.content : "Tap to chat"}
                    </p>

                    {unread > 0 && (
                      <span
                        style={{
                          backgroundColor: "var(--accent-primary)",
                          color: "#ffffff",
                          fontSize: "0.7rem",
                          fontWeight: "700",
                          borderRadius: "var(--radius-full)",
                          minWidth: "20px",
                          height: "20px",
                          padding: "0 6px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 0 10px rgba(99, 102, 241, 0.5)",
                        }}
                      >
                        {unread > 9 ? "9+" : unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
