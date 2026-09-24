const prisma = require("../config/prisma");

// CREATE NOTIFICATION
const createNotification = async ({
  userId,
  title,
  message,
  type = "SYSTEM",
}) => {
  return prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
    },
  });
};

// CREATE NOTIFICATIONS FOR USERS
const createNotificationsForUsers = async ({
  userIds,
  title,
  message,
  type = "SYSTEM",
}) => {
  if (!userIds.length) {
    return [];
  }

  return prisma.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      title,
      message,
      type,
    })),
  });
};

// GET ADMIN USER IDS
const getAdminUserIds = async () => {
  const admins = await prisma.user.findMany({
    where: {
      role: {
        name: "ADMIN",
      },
    },
    select: {
      id: true,
    },
  });

  return admins.map((admin) => admin.id);
};

// NOTIFY ADMINS
const notifyAdmins = async ({
  title,
  message,
  type = "SYSTEM",
}) => {
  const adminIds = await getAdminUserIds();

  return createNotificationsForUsers({
    userIds: adminIds,
    title,
    message,
    type,
  });
};

// LOW STOCK NOTIFICATION
const notifyLowStock = async (product) => {
  const LOW_STOCK_THRESHOLD = 5;

  if (product.stock > LOW_STOCK_THRESHOLD) {
    return;
  }

  return notifyAdmins({
    title: "Low Stock Alert",
    message: `${product.name} stock is now ${product.stock}. Please restock this product.`,
    type: "LOW_STOCK",
  });
};

module.exports = {
  createNotification,
  createNotificationsForUsers,
  getAdminUserIds,
  notifyAdmins,
  notifyLowStock,
};