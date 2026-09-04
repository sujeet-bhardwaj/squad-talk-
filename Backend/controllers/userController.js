const User = require("../models/User");

// @desc    Search users or get all users except the requester
// @route   GET /api/users?search=query
// @access  Private
const getUsers = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
            { mobile: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(keyword)
      .find({ _id: { $ne: req.user._id } })
      .select("-password")
      .sort({ name: 1 })
      .limit(30);

    return res.status(200).json(users);
  } catch (error) {
    console.error("[GetUsers Error]:", error);
    return res.status(500).json({ message: error.message || "Server error fetching users" });
  }
};

// @desc    Get specific user profile
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error("[GetUserById Error]:", error);
    return res.status(500).json({ message: "Server error fetching user" });
  }
};

// @desc    Update current user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, mobile, statusMessage, profilePictureUrl } = req.body;

    if (name && name.trim()) user.name = name.trim();
    if (mobile !== undefined) user.mobile = mobile.trim();
    if (statusMessage !== undefined) user.statusMessage = statusMessage.trim();

    // If an image file was uploaded via Multer
    if (req.file) {
      user.profilePicture = `/uploads/${req.file.filename}`;
    } else if (profilePictureUrl) {
      user.profilePicture = profilePictureUrl;
    }

    const updatedUser = await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        mobile: updatedUser.mobile,
        profilePicture: updatedUser.profilePicture,
        statusMessage: updatedUser.statusMessage,
        isOnline: updatedUser.isOnline,
        lastSeen: updatedUser.lastSeen,
      },
    });
  } catch (error) {
    console.error("[UpdateProfile Error]:", error);
    return res.status(500).json({ message: error.message || "Server error updating profile" });
  }
};

module.exports = { getUsers, getUserById, updateProfile };
