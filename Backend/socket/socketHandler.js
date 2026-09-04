const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Message = require("../models/Message");

// Map: userId -> Set of socket IDs
const onlineUsers = new Map();

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
    pingTimeout: 60000,
  });

  // Socket Authentication Handshake Middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) {
        return next(new Error("Authentication error: Token required"));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "default_jwt_secret_chat_2026"
      );

      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (err) {
      console.error("[Socket Auth Error]:", err.message);
      return next(new Error("Authentication error: Invalid or expired token"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.userId;
    console.log(`[Socket Connected] User: ${socket.user.name} (${userId}), Socket: ${socket.id}`);

    // Track active socket IDs for user
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Join personal user room for direct messaging & notifications
    socket.join(`user:${userId}`);

    // Update DB status to online
    try {
      await User.findByIdAndUpdate(userId, { isOnline: true });
    } catch (e) {
      console.error("Error updating user online status:", e.message);
    }

    // Broadcast updated online user IDs list to all clients
    const activeUserIds = Array.from(onlineUsers.keys());
    io.emit("get_online_users", activeUserIds);

    // Handle joining a specific chat room
    socket.on("join_chat", (chatId) => {
      if (chatId) {
        socket.join(`chat:${chatId}`);
        console.log(`[Socket] User ${socket.user.name} joined chat room: chat:${chatId}`);
      }
    });

    // Handle leaving a chat room
    socket.on("leave_chat", (chatId) => {
      if (chatId) {
        socket.leave(`chat:${chatId}`);
        console.log(`[Socket] User ${socket.user.name} left chat room: chat:${chatId}`);
      }
    });

    // Real-time sending & broadcasting messages
    socket.on("send_message", (messageData) => {
      if (!messageData || !messageData.chat) return;

      const chat = messageData.chat;
      const chatId = chat._id || chat;

      // Broadcast to active chat room
      socket.to(`chat:${chatId}`).emit("receive_message", messageData);

      // Also deliver to individual participant rooms (so sidebar updates even if room isn't open)
      if (chat.users && Array.isArray(chat.users)) {
        chat.users.forEach((participant) => {
          const participantId = participant._id ? participant._id.toString() : participant.toString();
          if (participantId !== userId) {
            io.to(`user:${participantId}`).emit("receive_message", messageData);
          }
        });
      }
    });

    // Real-time typing indicators
    socket.on("typing", ({ chatId, userName }) => {
      if (!chatId) return;
      socket.to(`chat:${chatId}`).emit("user_typing", {
        chatId,
        userId,
        userName: userName || socket.user.name,
      });
    });

    socket.on("stop_typing", ({ chatId }) => {
      if (!chatId) return;
      socket.to(`chat:${chatId}`).emit("user_stop_typing", {
        chatId,
        userId,
      });
    });

    // Real-time read receipt updates
    socket.on("message_seen", async ({ chatId, messageIds }) => {
      if (!chatId) return;

      try {
        // Mark in database as read
        await Message.updateMany(
          {
            chat: chatId,
            sender: { $ne: userId },
            readBy: { $ne: userId },
          },
          { $addToSet: { readBy: userId } }
        );

        // Notify chat participants that messages were read
        io.to(`chat:${chatId}`).emit("messages_read", {
          chatId,
          readerId: userId,
          messageIds,
        });
      } catch (err) {
        console.error("Error processing message_seen:", err.message);
      }
    });

    // Handle disconnect
    socket.on("disconnect", async () => {
      console.log(`[Socket Disconnected] User: ${socket.user?.name || userId}, Socket: ${socket.id}`);

      if (onlineUsers.has(userId)) {
        const userSockets = onlineUsers.get(userId);
        userSockets.delete(socket.id);

        if (userSockets.size === 0) {
          onlineUsers.delete(userId);

          // Update DB status to offline & record lastSeen
          try {
            await User.findByIdAndUpdate(userId, {
              isOnline: false,
              lastSeen: new Date(),
            });
          } catch (e) {
            console.error("Error updating user offline status:", e.message);
          }
        }
      }

      // Broadcast updated online users list
      io.emit("get_online_users", Array.from(onlineUsers.keys()));
    });
  });

  return io;
};

module.exports = { initSocket, onlineUsers };
