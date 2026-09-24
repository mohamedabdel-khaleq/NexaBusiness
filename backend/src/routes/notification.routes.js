const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");

const {
  createNotification,
  getMyNotifications,
  getUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} = require("../controllers/notification.controller");

const router = express.Router();

// Create notification
router.post(
  "/",
  authMiddleware,
  createNotification
);

// Get my notifications
router.get(
  "/",
  authMiddleware,
  getMyNotifications
);

// Get unread notifications
router.get(
  "/unread",
  authMiddleware,
  getUnreadNotifications
);

// Mark all as read
router.put(
  "/read-all",
  authMiddleware,
  markAllNotificationsAsRead
);

// Mark one as read
router.put(
  "/:id/read",
  authMiddleware,
  markNotificationAsRead
);

// Delete notification
router.delete(
  "/:id",
  authMiddleware,
  deleteNotification
);

module.exports = router;