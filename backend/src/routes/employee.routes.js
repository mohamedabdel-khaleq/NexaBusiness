const express = require("express");

const validate = require("../middleware/validation.middleware");

const {
  createEmployeeSchema,
  updateEmployeeSchema,
} = require("../validators/employee.validator");

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

// CREATE EMPLOYEE

router.post(
  "/",
  authMiddleware,
  requirePermission("employees.manage"),
  validate(createEmployeeSchema),
  createEmployee
);

// GET ALL EMPLOYEES

router.get(
  "/",
  authMiddleware,
  requirePermission("employees.read"),
  getAllEmployees
);

// GET EMPLOYEE BY ID

router.get(
  "/:id",
  authMiddleware,
  requirePermission("employees.read"),
  getEmployeeById
);

// UPDATE EMPLOYEE

router.put(
  "/:id",
  authMiddleware,
  requirePermission("employees.manage"),
  validate(updateEmployeeSchema),
  updateEmployee
);

// DELETE EMPLOYEE

router.delete(
  "/:id",
  authMiddleware,
  requirePermission("employees.manage"),
  deleteEmployee
);

module.exports = router;