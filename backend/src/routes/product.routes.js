const express = require("express");

const validate = require("../middleware/validation.middleware");

const {
  createProductSchema,
  updateProductSchema,
} = require("../validators/product.validator");

const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");

const authMiddleware = require("../middleware/auth.middleware");
const requirePermission = require("../middleware/permission.middleware");

const router = express.Router();

// CREATE PRODUCT
router.post(
  "/",
  authMiddleware,
  requirePermission("products.create"),
  validate(createProductSchema),
  createProduct
);

// GET ALL PRODUCTS
router.get(
  "/",
  authMiddleware,
  requirePermission("products.read"),
  getAllProducts
);

// GET PRODUCT BY ID
router.get(
  "/:id",
  authMiddleware,
  requirePermission("products.read"),
  getProductById
);

// UPDATE PRODUCT
router.put(
  "/:id",
  authMiddleware,
  requirePermission("products.update"),
  validate(updateProductSchema),
  updateProduct
);

// DELETE PRODUCT
router.delete(
  "/:id",
  authMiddleware,
  requirePermission("products.delete"),
  deleteProduct
);

module.exports = router;