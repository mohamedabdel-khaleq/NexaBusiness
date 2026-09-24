const prisma = require("../config/prisma");

// CREATE NOTIFICATION
const createNotification = async (req, res) => {
  const { userId, title, message, type } = req.body;

  try {
    if (!userId || !title || !message) {
      return res.status(400).json({
        message: "UserId, title and message are required",
      });
    }

    const parsedUserId = parseInt(userId);

    if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
      return res.status(400).json({
        message: "User ID must be a positive integer",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: parsedUserId,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const notification = await prisma.notification.create({
      data: {
        userId: parsedUserId,
        title: title.trim(),
        message: message.trim(),
        type: type || "SYSTEM",
      },
    });

    return res.status(201).json({
      message: "Notification created successfully",
      notification,
    });
  } catch (error) {
    console.error("Create notification error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// GET MY NOTIFICATIONS
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      message: "Notifications retrieved successfully",
      notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// GET UNREAD NOTIFICATIONS
const getUnreadNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: req.user.id,
        isRead: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      message: "Unread notifications retrieved successfully",
      notifications,
    });
  } catch (error) {
    console.error("Get unread notifications error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// MARK ONE NOTIFICATION AS READ
const markNotificationAsRead = async (req, res) => {
  const notificationId = parseInt(req.params.id);

  try {
    if (!Number.isInteger(notificationId) || notificationId <= 0) {
      return res.status(400).json({
        message: "Notification ID must be a positive integer",
      });
    }

    const notification = await prisma.notification.findUnique({
      where: {
        id: notificationId,
      },
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    // User can only modify their own notification
    if (notification.userId !== req.user.id) {
      return res.status(403).json({
        message: "You do not have access to this notification",
      });
    }

    const updatedNotification = await prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        isRead: true,
      },
    });

    return res.status(200).json({
      message: "Notification marked as read",
      notification: updatedNotification,
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


// MARK ALL NOTIFICATIONS AS READ
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        userId: req.user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return res.status(200).json({
      message: "All notifications marked as read",
      updatedCount: result.count,
    });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// DELETE NOTIFICATION
const deleteNotification = async (req, res) => {
  const notificationId = parseInt(req.params.id);

  try {
    if (!Number.isInteger(notificationId) || notificationId <= 0) {
      return res.status(400).json({
        message: "Notification ID must be a positive integer",
      });
    }

    const notification = await prisma.notification.findUnique({
      where: {
        id: notificationId,
      },
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    // User can only delete their own notification
    if (notification.userId !== req.user.id) {
      return res.status(403).json({
        message: "You do not have access to this notification",
      });
    }

    await prisma.notification.delete({
      where: {
        id: notificationId,
      },
    });

    return res.status(200).json({
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Delete notification error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  createNotification,
  getMyNotifications,
  getUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
};