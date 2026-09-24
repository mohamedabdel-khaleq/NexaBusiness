const bcrypt = require("bcrypt");
const { notifyAdmins } = require("../services/notification.service");
const prisma = require("../config/prisma");

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        roleId: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    return res.status(200).json({
      message: "Users retrieved successfully",
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        message: "User ID must be a positive integer",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        roleId: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "User retrieved successfully",
      user,
    });
  } catch (error) {
    console.error("Get user error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Create user
const createUser = async (req, res) => {
  try {
    const { name, email, password, roleId } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    const role = await prisma.role.findUnique({
      where: {
        id: roleId,
      },
    });

    if (!role) {
      return res.status(404).json({
        message: "Role not found",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        roleId: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    // Notify admins
    try {
      await notifyAdmins({
        title: "New User",
        message: `New user "${user.name}" was created successfully.`,
        type: "USER",
      });

      console.log(
        `New user notification sent for user #${user.id}`
      );
    } catch (notificationError) {
      console.error(
        "New user notification error:",
        notificationError
      );
    }

    return res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.error("Create user error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        message: "User ID must be a positive integer",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const { name, email, password, roleId } = req.body;

    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (emailExists) {
        return res.status(409).json({
          message: "Email already exists",
        });
      }
    }

    if (roleId !== undefined) {
      const role = await prisma.role.findUnique({
        where: {
          id: roleId,
        },
      });

      if (!role) {
        return res.status(404).json({
          message: "Role not found",
        });
      }
    }

    const updateData = {};

    if (name !== undefined) {
      updateData.name = name;
    }

    if (email !== undefined) {
      updateData.email = email;
    }

    if (roleId !== undefined) {
      updateData.roleId = roleId;
    }

    if (password !== undefined) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        roleId: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update user error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Change user role
const updateUserRole = async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        message: "User ID must be a positive integer",
      });
    }

    const { roleId } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const role = await prisma.role.findUnique({
      where: {
        id: roleId,
      },
    });

    if (!role) {
      return res.status(404).json({
        message: "Role not found",
      });
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        roleId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        roleId: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      message: "User role updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update user role error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        message: "User ID must be a positive integer",
      });
    }

    if (userId === req.user.id) {
      return res.status(400).json({
        message: "You cannot delete your own account",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserRole,
  deleteUser,
};