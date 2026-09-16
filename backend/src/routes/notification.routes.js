const express = require("express");

const {
  createNotification,
  getMyNotifications,
  markAsRead,
  deleteNotification,
} = require("../controllers/notification.controller");

const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", authMiddleware, createNotification);
router.get("/", authMiddleware, getMyNotifications);
router.patch("/:id/read", authMiddleware, markAsRead);
router.delete("/:id", authMiddleware, deleteNotification);

module.exports = router;