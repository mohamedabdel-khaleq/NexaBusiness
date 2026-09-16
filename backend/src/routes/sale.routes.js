const express = require("express");

const {
  createSale,
  getAllSales,
  getSaleById,
} = require("../controllers/sale.controller");

const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", authMiddleware, createSale);
router.get("/", authMiddleware, getAllSales);
router.get("/:id", authMiddleware, getSaleById);

module.exports = router;