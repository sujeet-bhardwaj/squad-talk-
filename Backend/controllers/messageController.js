const Message = require("../models/Message");
const User = require("../models/User");
const Chat = require("../models/Chat");

// @desc    Send a new Message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  const { content, chatId, attachments } = req.body;

  if ((!content || !content.trim()) && (!attachments || attachments.length === 0)) {
    return res.status(400).json({ message: "Invalid message data passed into request" });
  }

  if (!chatId) {
    return res.status(400).json({ message: "ChatId is required" });
  }

  const newMessage = {
    sender: req.user._id,
    content: content ? content.trim() : "",
    chat: chatId,
    readBy: [req.user._id],
    attachments: attachments || [],
  };

  try {
    let message = await Message.create(newMessage);

    message = await message.populate("sender", "name profilePicture email");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name profilePicture email isOnline lastSeen",
    });

    await Chat.findByIdAndUpdate(chatId, { latestMessage: message._id });

    return res.status(201).json(message);
  } catch (error) {
    console.error("[SendMessage Error]:", error);
    return res.status(500).json({ message: error.message || "Server error sending message" });
  }
};

// @desc    Get all messages for a specific chat
// @route   GET /api/messages/:chatId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await Message.find({ chat: chatId, isDeleted: false })
      .populate("sender", "name profilePicture email")
      .populate("readBy", "name profilePicture")
      .sort({ createdAt: 1 });

    return res.status(200).json(messages);
  } catch (error) {
    console.error("[GetMessages Error]:", error);
    return res.status(500).json({ message: error.message || "Server error fetching messages" });
  }
};

// @desc    Mark all unread messages as read by current user in a chat
// @route   PUT /api/messages/read/:chatId
// @access  Private
const markMessagesAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    const result = await Message.updateMany(
      {
        chat: chatId,
        sender: { $ne: userId },
        readBy: { $ne: userId },
      },
      {
        $addToSet: { readBy: userId },
      }
    );

    return res.status(200).json({
      message: "Messages marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("[MarkMessagesRead Error]:", error);
    return res.status(500).json({ message: error.message || "Server error marking messages read" });
  }
};

module.exports = { sendMessage, getMessages, markMessagesAsRead };
