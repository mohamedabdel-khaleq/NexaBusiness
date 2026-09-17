const express = require("express");

const {
  createInventoryTransaction,
  getAllInventoryTransactions,
  getInventoryTransactionById,
} = require("../controllers/inventory.controller");

const authMiddleware = require("../middleware/auth.middleware");
const requirePermission = require("../middleware/permission.middleware");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  requirePermission("inventory.manage"),
  createInventoryTransaction
);

router.get(
  "/",
  authMiddleware,
  requirePermission("inventory.read"),
  getAllInventoryTransactions
);

router.get(
  "/:id",
  authMiddleware,
  requirePermission("inventory.read"),
  getInventoryTransactionById
);

module.exports = router;