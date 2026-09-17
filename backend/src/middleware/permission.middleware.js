const prisma = require("../config/prisma");

const requirePermission = (permissionName) => {
  return async (req, res, next) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: req.user.id,
        },
        include: {
          role: {
            include: {
              permissions: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(401).json({
          message: "User not found",
        });
      }

      const hasPermission = user.role.permissions.some(
        (permission) => permission.name === permissionName
      );

      if (!hasPermission) {
        return res.status(403).json({
          message: "You do not have permission to perform this action",
        });
      }

      next();
    } catch (error) {
      console.error("Permission middleware error:", error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  };
};

module.exports = requirePermission;