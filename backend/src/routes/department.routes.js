const express = require("express");

const validate = require("../middleware/validation.middleware");

const {
  createDepartmentSchema,
  updateDepartmentSchema,
} = require("../validators/department.validator");

const {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
} = require("../controllers/department.controller");

const authMiddleware = require("../middleware/auth.middleware");
const requirePermission = require("../middleware/permission.middleware");

const router = express.Router();

// CREATE DEPARTMENT
router.post(
  "/",
  authMiddleware,
  requirePermission("employees.manage"),
  validate(createDepartmentSchema),
  createDepartment
);

// GET ALL DEPARTMENTS
router.get(
  "/",
  authMiddleware,
  requirePermission("employees.read"),
  getAllDepartments
);

// GET DEPARTMENT BY ID
router.get(
  "/:id",
  authMiddleware,
  requirePermission("employees.read"),
  getDepartmentById
);

// UPDATE DEPARTMENT
router.put(
  "/:id",
  authMiddleware,
  requirePermission("employees.manage"),
  validate(updateDepartmentSchema),
  updateDepartment
);

// DELETE DEPARTMENT
router.delete(
  "/:id",
  authMiddleware,
  requirePermission("employees.manage"),
  deleteDepartment
);

module.exports = router;