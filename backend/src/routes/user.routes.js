const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");
const requirePermission = require("../middleware/permission.middleware");
const validate = require("../middleware/validation.middleware");

const {
  createUserSchema,
  updateUserSchema,
  updateUserRoleSchema,
} = require("../validators/user.validator");

const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserRole,
  deleteUser,
} = require("../controllers/user.controller");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  requirePermission("users.manage"),
  getAllUsers
);

router.get(
  "/:id",
  authMiddleware,
  requirePermission("users.manage"),
  getUserById
);

router.post(
  "/",
  authMiddleware,
  requirePermission("users.manage"),
  validate(createUserSchema),
  createUser
);

router.put(
  "/:id",
  authMiddleware,
  requirePermission("users.manage"),
  validate(updateUserSchema),
  updateUser
);

router.put(
  "/:id/role",
  authMiddleware,
  requirePermission("users.manage"),
  validate(updateUserRoleSchema),
  updateUserRole
);

router.delete(
  "/:id",
  authMiddleware,
  requirePermission("users.manage"),
  deleteUser
);

module.exports = router;