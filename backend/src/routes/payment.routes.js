const express = require("express");

const {
  createPayment,
  getAllPayments,
  getPaymentById,
} = require("../controllers/payment.controller");

const authMiddleware = require("../middleware/auth.middleware");
const requirePermission = require("../middleware/permission.middleware");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  requirePermission("payments.create"),
  createPayment
);

router.get(
  "/",
  authMiddleware,
  requirePermission("payments.read"),
  getAllPayments
);

router.get(
  "/:id",
  authMiddleware,
  requirePermission("payments.read"),
  getPaymentById
);

module.exports = router;