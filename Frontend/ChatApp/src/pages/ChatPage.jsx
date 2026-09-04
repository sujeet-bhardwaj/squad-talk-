import React, { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useSocketStore } from "../store/useSocketStore";
import Sidebar from "../components/chat/Sidebar";
import ChatHeader from "../components/chat/ChatHeader";
import MessageArea from "../components/chat/MessageArea";
import MessageInput from "../components/chat/MessageInput";
import EmptyChatState from "../components/chat/EmptyChatState";

export const ChatPage = () => {
  const { token, user } = useAuthStore();
  const { selectedChat, setSelectedChat } = useChatStore();
  const { connectSocket, disconnectSocket } = useSocketStore();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Connect socket with authenticated JWT token
  useEffect(() => {
    if (token) {
      connectSocket(token);
    }
    return () => {
      disconnectSocket();
    };
  }, [token, connectSocket, disconnectSocket]);

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        backgroundColor: "var(--bg-primary)",
        overflow: "hidden",
      }}
    >
      {/* Sidebar: Rendered always on desktop, or on mobile when no chat is selected */}
      {(!isMobile || !selectedChat) && (
        <div
          style={{
            width: isMobile ? "100%" : "380px",
            height: "100%",
            flexShrink: 0,
          }}
        >
          <Sidebar onSelectChatMobile={() => {}} />
        </div>
      )}

      {/* Main Chat Area: Rendered always on desktop, or on mobile when chat is selected */}
      {(!isMobile || selectedChat) && (
        <main
          style={{
            flex: 1,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            backgroundColor: "var(--bg-primary)",
          }}
        >
          {selectedChat ? (
            <>
              <ChatHeader onBackMobile={isMobile ? () => setSelectedChat(null) : null} />
              <MessageArea />
              <MessageInput />
            </>
          ) : (
            <EmptyChatState />
          )}
        </main>
      )}
    </div>
  );
};

export default ChatPage;
