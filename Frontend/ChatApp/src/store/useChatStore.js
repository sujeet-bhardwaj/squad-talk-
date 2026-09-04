import { create } from "zustand";
import axiosClient from "../api/axiosClient";

// Audio notification using Web Audio API (clean subtle chime, no asset loading needed)
const playNotificationChime = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12); // A5

    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.35);
  } catch (e) {
    // Ignore audio context errors if not permitted yet by user interaction
  }
};

export const useChatStore = create((set, get) => ({
  chats: [],
  selectedChat: null,
  messages: [],
  onlineUsers: [],
  typingUsers: {}, // { [chatId]: [userName1, userName2] }
  unreadCounts: {}, // { [chatId]: count }
  isLoadingChats: false,
  isLoadingMessages: false,
  isSendingMessage: false,
  searchResults: [],
  isSearching: false,

  fetchChats: async () => {
    set({ isLoadingChats: true });
    try {
      const response = await axiosClient.get("/api/chats");
      set({ chats: response.data, isLoadingChats: false });
    } catch (err) {
      console.error("Error fetching chats:", err);
      set({ isLoadingChats: false });
    }
  },

  setSelectedChat: (chat) => {
    set({ selectedChat: chat });
    if (chat) {
      get().fetchMessages(chat._id);
      get().markChatAsRead(chat._id);
    } else {
      set({ messages: [] });
    }
  },

  fetchMessages: async (chatId) => {
    if (!chatId) return;
    set({ isLoadingMessages: true });
    try {
      const response = await axiosClient.get(`/api/messages/${chatId}`);
      set({ messages: response.data, isLoadingMessages: false });
    } catch (err) {
      console.error("Error fetching messages:", err);
      set({ isLoadingMessages: false });
    }
  },

  sendMessage: async (content, attachments = []) => {
    const { selectedChat, messages, chats } = get();
    if (!selectedChat) return null;

    set({ isSendingMessage: true });
    try {
      const response = await axiosClient.post("/api/messages", {
        content,
        chatId: selectedChat._id,
        attachments,
      });

      const newMessage = response.data;

      // Update local messages state
      set({
        messages: [...messages, newMessage],
        isSendingMessage: false,
      });

      // Update latest message in chats list
      const updatedChats = chats.map((c) =>
        c._id === selectedChat._id ? { ...c, latestMessage: newMessage, updatedAt: new Date().toISOString() } : c
      );
      // Move active chat to the top
      updatedChats.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
      set({ chats: updatedChats });

      return newMessage;
    } catch (err) {
      console.error("Error sending message:", err);
      set({ isSendingMessage: false });
      return null;
    }
  },

  receiveMessage: (newMessage) => {
    const { selectedChat, messages, chats } = get();
    const chatId = newMessage.chat._id || newMessage.chat;

    playNotificationChime();

    // If message is in currently active chat
    if (selectedChat && selectedChat._id === chatId) {
      // Avoid duplicate insertion
      const exists = messages.some((m) => m._id === newMessage._id);
      if (!exists) {
        set({ messages: [...messages, newMessage] });
        get().markChatAsRead(chatId);
      }
    } else {
      // Increase unread count
      set((state) => ({
        unreadCounts: {
          ...state.unreadCounts,
          [chatId]: (state.unreadCounts[chatId] || 0) + 1,
        },
      }));
    }

    // Update conversation item latestMessage and resort
    const chatExists = chats.some((c) => c._id === chatId);
    if (chatExists) {
      const updatedChats = chats.map((c) =>
        c._id === chatId ? { ...c, latestMessage: newMessage, updatedAt: new Date().toISOString() } : c
      );
      updatedChats.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
      set({ chats: updatedChats });
    } else {
      // If a brand new conversation arrived, refetch conversations
      get().fetchChats();
    }
  },

  markChatAsRead: async (chatId) => {
    try {
      await axiosClient.put(`/api/messages/read/${chatId}`);
      set((state) => ({
        unreadCounts: {
          ...state.unreadCounts,
          [chatId]: 0,
        },
      }));
    } catch (err) {
      console.error("Error marking messages read:", err);
    }
  },

  updateMessagesRead: (chatId, readerId) => {
    const { selectedChat, messages } = get();
    if (selectedChat && selectedChat._id === chatId) {
      const updated = messages.map((msg) => {
        const alreadyRead = msg.readBy?.some(
          (u) => (u._id || u).toString() === readerId.toString()
        );
        if (!alreadyRead) {
          return {
            ...msg,
            readBy: [...(msg.readBy || []), readerId],
          };
        }
        return msg;
      });
      set({ messages: updated });
    }
  },

  setOnlineUsers: (onlineUsers) => {
    set({ onlineUsers });
  },

  setTyping: (chatId, userName, isTyping) => {
    set((state) => {
      const currentList = state.typingUsers[chatId] || [];
      let updated;
      if (isTyping) {
        if (!currentList.includes(userName)) {
          updated = [...currentList, userName];
        } else {
          updated = currentList;
        }
      } else {
        updated = currentList.filter((name) => name !== userName);
      }
      return {
        typingUsers: {
          ...state.typingUsers,
          [chatId]: updated,
        },
      };
    });
  },

  searchUsers: async (query) => {
    if (!query || !query.trim()) {
      set({ searchResults: [], isSearching: false });
      return;
    }
    set({ isSearching: true });
    try {
      const response = await axiosClient.get(`/api/users?search=${encodeURIComponent(query)}`);
      set({ searchResults: response.data, isSearching: false });
    } catch (err) {
      console.error("Error searching users:", err);
      set({ searchResults: [], isSearching: false });
    }
  },

  startChatWithUser: async (targetUserId) => {
    try {
      const response = await axiosClient.post("/api/chats", { userId: targetUserId });
      const chat = response.data;

      // Add to chats list if not already present
      const { chats } = get();
      if (!chats.some((c) => c._id === chat._id)) {
        set({ chats: [chat, ...chats] });
      }

      get().setSelectedChat(chat);
      set({ searchResults: [] });
      return chat;
    } catch (err) {
      console.error("Error accessing/creating chat:", err);
      return null;
    }
  },
}));
