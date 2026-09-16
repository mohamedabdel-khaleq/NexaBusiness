const express = require("express");

const {
  createPayment,
  getAllPayments,
  getPaymentById,
} = require("../controllers/payment.controller");

const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", authMiddleware, createPayment);
router.get("/", authMiddleware, getAllPayments);
router.get("/:id", authMiddleware, getPaymentById);

module.exports = router;