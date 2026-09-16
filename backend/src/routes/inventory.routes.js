const express = require("express");

const {
  createInventoryTransaction,
  getAllInventoryTransactions,
  getInventoryTransactionById,
} = require("../controllers/inventory.controller");

const authMiddleware = require("../middleware/auth.middleware");
const router = express.Router();

router.post("/", authMiddleware, createInventoryTransaction);
router.get("/", authMiddleware, getAllInventoryTransactions);
router.get("/:id", authMiddleware, getInventoryTransactionById);

module.exports = router;