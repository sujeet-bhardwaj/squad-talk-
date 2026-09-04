const express = require("express");
const router = express.Router();
const {
  getUsers,
  getUserById,
  updateProfile,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.route("/").get(protect, getUsers);
router.route("/profile").put(protect, upload.single("profilePicture"), updateProfile);
router.route("/:id").get(protect, getUserById);

module.exports = router;
