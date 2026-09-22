const express = require("express");

const validate = require("../middleware/validation.middleware");

const {
  createSaleSchema,
} = require("../validators/sale.validator");

const {
  createSale,
  getAllSales,
  getSaleById,
} = require("../controllers/sale.controller");

const authMiddleware = require("../middleware/auth.middleware");
const requirePermission = require("../middleware/permission.middleware");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  requirePermission("sales.create"),
  validate(createSaleSchema),
  createSale
);

router.get(
  "/",
  authMiddleware,
  requirePermission("sales.read"),
  getAllSales
);

router.get(
  "/:id",
  authMiddleware,
  requirePermission("sales.read"),
  getSaleById
);

module.exports = router;