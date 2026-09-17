const express = require("express");

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