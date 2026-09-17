const express = require("express");

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

router.post(
  "/",
  authMiddleware,
  requirePermission("products.create"),
  createProduct
);

router.get(
  "/",
  authMiddleware,
  requirePermission("products.read"),
  getAllProducts
);

router.get(
  "/:id",
  authMiddleware,
  requirePermission("products.read"),
  getProductById
);

router.put(
  "/:id",
  authMiddleware,
  requirePermission("products.update"),
  updateProduct
);

router.delete(
  "/:id",
  authMiddleware,
  requirePermission("products.delete"),
  deleteProduct
);

module.exports = router;