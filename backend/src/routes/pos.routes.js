const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");
const requirePermission = require("../middleware/permission.middleware");

const {
  getProductByBarcode,
} = require("../controllers/product.controller");

const {
  checkout,
} = require("../controllers/pos.controller");

const router = express.Router();

// SCAN PRODUCT BY BARCODE
router.get(
  "/scan/:barcode",
  authMiddleware,
  requirePermission("products.read"),
  getProductByBarcode
);

// POS CHECKOUT
router.post(
  "/checkout",
  authMiddleware,
  requirePermission("sales.create"),
  checkout
);

module.exports = router;