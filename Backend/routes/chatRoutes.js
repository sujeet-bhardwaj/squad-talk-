const express = require("express");
const router = express.Router();
const {
  accessOrCreateChat,
  fetchChats,
  createGroupChat,
} = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

router.route("/").post(protect, accessOrCreateChat).get(protect, fetchChats);
router.route("/group").post(protect, createGroupChat);

module.exports = router;
