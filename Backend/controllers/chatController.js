const Chat = require("../models/Chat");
const User = require("../models/User");

// @desc    Access or create 1-on-1 chat
// @route   POST /api/chats
// @access  Private
const accessOrCreateChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "UserId param not sent with request" });
  }

  if (userId.toString() === req.user._id.toString()) {
    return res.status(400).json({ message: "Cannot create a chat with yourself" });
  }

  try {
    let isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "name profilePicture email",
    });

    if (isChat.length > 0) {
      return res.status(200).json(isChat[0]);
    } else {
      const otherUser = await User.findById(userId);
      if (!otherUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const chatData = {
        chatName: otherUser.name,
        isGroupChat: false,
        users: [req.user._id, userId],
      };

      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      return res.status(200).json(fullChat);
    }
  } catch (error) {
    console.error("[AccessChat Error]:", error);
    return res.status(500).json({ message: error.message || "Server error accessing chat" });
  }
};

// @desc    Fetch all chats for the logged in user
// @route   GET /api/chats
// @access  Private
const fetchChats = async (req, res) => {
  try {
    let chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    chats = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "name profilePicture email",
    });

    return res.status(200).json(chats);
  } catch (error) {
    console.error("[FetchChats Error]:", error);
    return res.status(500).json({ message: error.message || "Server error fetching chats" });
  }
};

// @desc    Create new Group Chat
// @route   POST /api/chats/group
// @access  Private
const createGroupChat = async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).json({ message: "Please provide group name and members" });
  }

  let users = typeof req.body.users === "string" ? JSON.parse(req.body.users) : req.body.users;

  if (users.length < 2) {
    return res.status(400).json({ message: "A group chat requires at least 2 other members" });
  }

  users.push(req.user._id);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user._id,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    return res.status(200).json(fullGroupChat);
  } catch (error) {
    console.error("[CreateGroupChat Error]:", error);
    return res.status(500).json({ message: error.message || "Server error creating group" });
  }
};

module.exports = { accessOrCreateChat, fetchChats, createGroupChat };
