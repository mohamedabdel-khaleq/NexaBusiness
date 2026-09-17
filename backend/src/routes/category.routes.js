const express = require("express");

const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.controller");

const authMiddleware = require("../middleware/auth.middleware");
const requirePermission = require("../middleware/permission.middleware");

const router = express.Router();

// CREATE CATEGORY
router.post(
  "/",
  authMiddleware,
  requirePermission("categories.create"),
  createCategory
);

// GET ALL CATEGORIES
router.get(
  "/",
  authMiddleware,
  requirePermission("categories.read"),
  getAllCategories
);

// GET CATEGORY BY ID
router.get(
  "/:id",
  authMiddleware,
  requirePermission("categories.read"),
  getCategoryById
);

// UPDATE CATEGORY
router.put(
  "/:id",
  authMiddleware,
  requirePermission("categories.update"),
  updateCategory
);

// DELETE CATEGORY
router.delete(
  "/:id",
  authMiddleware,
  requirePermission("categories.delete"),
  deleteCategory
);

module.exports = router;