const express = require("express");
const validate = require("../middleware/validation.middleware");

const {
  createCategorySchema,
  updateCategorySchema,
} = require("../validators/category.validator");

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
//post CATEGORY
router.post(
  "/",
  authMiddleware,
  requirePermission("categories.create"),
  validate(createCategorySchema),
  createCategory
);
//Update CATEGORY
router.put(
  "/:id",
  authMiddleware,
  requirePermission("categories.update"),
  validate(updateCategorySchema),
  updateCategory
);
// GET 
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



// DELETE CATEGORY
router.delete(
  "/:id",
  authMiddleware,
  requirePermission("categories.delete"),
  deleteCategory
);

module.exports = router;