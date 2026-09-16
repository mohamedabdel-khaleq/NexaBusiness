const prisma = require("../config/prisma");

//CREATE NOTIFICATION

const createNotification = async (req, res) => {
  const { userId, title, message } = req.body;

  try {
    if (!userId || !title || !message) {
      return res.status(400).json({
        message: "UserId, title and message are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(userId),
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const notification = await prisma.notification.create({
      data: {
        userId: parseInt(userId),
        title,
        message,
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

//GET MY NOTIFICATIONS

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

//MARK AS READ

const markAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    const notification = await prisma.notification.findFirst({
      where: {
        id: parseInt(id),
        userId: req.user.id,
      },
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    const updatedNotification = await prisma.notification.update({
      where: {
        id: parseInt(id),
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

//DELETE NOTIFICATION

const deleteNotification = async (req, res) => {
  const { id } = req.params;

  try {
    const notification = await prisma.notification.findFirst({
      where: {
        id: parseInt(id),
        userId: req.user.id,
      },
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    await prisma.notification.delete({
      where: {
        id: parseInt(id),
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
  markAsRead,
  deleteNotification,
};