const express = require("express");

const validate = require("../middleware/validation.middleware");

const {
  createInventorySchema,
} = require("../validators/inventory.validator");

const {
  createInventoryTransaction,
  getAllInventoryTransactions,
  getInventoryTransactionById,
} = require("../controllers/inventory.controller");

const authMiddleware = require("../middleware/auth.middleware");
const requirePermission = require("../middleware/permission.middleware");

const router = express.Router();

// CREATE INVENTORY TRANSACTION
router.post(
  "/",
  authMiddleware,
  requirePermission("inventory.manage"),
  validate(createInventorySchema),
  createInventoryTransaction
);

// GET ALL INVENTORY TRANSACTIONS
router.get(
  "/",
  authMiddleware,
  requirePermission("inventory.read"),
  getAllInventoryTransactions
);

// GET INVENTORY TRANSACTION BY ID
router.get(
  "/:id",
  authMiddleware,
  requirePermission("inventory.read"),
  getInventoryTransactionById
);

module.exports = router;