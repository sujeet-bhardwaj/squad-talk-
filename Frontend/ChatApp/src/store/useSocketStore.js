import { create } from "zustand";
import { io } from "socket.io-client";
import { API_BASE_URL } from "../api/axiosClient";
import { useChatStore } from "./useChatStore";

export const useSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,

  connectSocket: (token) => {
    if (!token) return;

    // Disconnect existing if any
    const currentSocket = get().socket;
    if (currentSocket) {
      currentSocket.disconnect();
    }

    const socket = io(API_BASE_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("⚡ [Socket] Connected:", socket.id);
      set({ isConnected: true });
    });

    socket.on("connect_error", (err) => {
      console.warn("⚠️ [Socket Connection Error]:", err.message);
      set({ isConnected: false });
    });

    socket.on("disconnect", (reason) => {
      console.log("🔌 [Socket Disconnected]:", reason);
      set({ isConnected: false });
    });

    // Real-time online users presence
    socket.on("get_online_users", (onlineUserIds) => {
      useChatStore.getState().setOnlineUsers(onlineUserIds);
    });

    // Incoming direct message
    socket.on("receive_message", (message) => {
      useChatStore.getState().receiveMessage(message);
    });

    // Real-time typing indicators
    socket.on("user_typing", ({ chatId, userName }) => {
      useChatStore.getState().setTyping(chatId, userName, true);
    });

    socket.on("user_stop_typing", ({ chatId }) => {
      useChatStore.getState().setTyping(chatId, null, false);
    });

    // Real-time read receipts
    socket.on("messages_read", ({ chatId, readerId }) => {
      useChatStore.getState().updateMessagesRead(chatId, readerId);
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  joinChat: (chatId) => {
    const { socket } = get();
    if (socket && chatId) {
      socket.emit("join_chat", chatId);
    }
  },

  leaveChat: (chatId) => {
    const { socket } = get();
    if (socket && chatId) {
      socket.emit("leave_chat", chatId);
    }
  },

  emitSendMessage: (messageData) => {
    const { socket } = get();
    if (socket && messageData) {
      socket.emit("send_message", messageData);
    }
  },

  emitTyping: (chatId, userName) => {
    const { socket } = get();
    if (socket && chatId) {
      socket.emit("typing", { chatId, userName });
    }
  },

  emitStopTyping: (chatId) => {
    const { socket } = get();
    if (socket && chatId) {
      socket.emit("stop_typing", { chatId });
    }
  },

  emitMessageSeen: (chatId, messageIds = []) => {
    const { socket } = get();
    if (socket && chatId) {
      socket.emit("message_seen", { chatId, messageIds });
    }
  },
}));
