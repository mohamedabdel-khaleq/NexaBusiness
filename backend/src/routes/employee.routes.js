const express = require("express");

const {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employee.controller");

const authMiddleware = require("../middleware/auth.middleware");
const requirePermission = require("../middleware/permission.middleware");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  requirePermission("employees.manage"),
  createEmployee
);

router.get(
  "/",
  authMiddleware,
  requirePermission("employees.read"),
  getAllEmployees
);

router.get(
  "/:id",
  authMiddleware,
  requirePermission("employees.read"),
  getEmployeeById
);

router.put(
  "/:id",
  authMiddleware,
  requirePermission("employees.manage"),
  updateEmployee
);

router.delete(
  "/:id",
  authMiddleware,
  requirePermission("employees.manage"),
  deleteEmployee
);

module.exports = router;