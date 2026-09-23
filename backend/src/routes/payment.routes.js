const express = require("express");

const validate = require("../middleware/validation.middleware");

const {
  createPaymentSchema,
} = require("../validators/payment.validator");

const {
  createPayment,
  getAllPayments,
  getPaymentById,
} = require("../controllers/payment.controller");

const authMiddleware = require("../middleware/auth.middleware");
const requirePermission = require("../middleware/permission.middleware");

const router = express.Router();

// CREATE PAYMENT
router.post(
  "/",
  authMiddleware,
  requirePermission("payments.create"),
  validate(createPaymentSchema),
  createPayment
);

// GET ALL PAYMENTS
router.get(
  "/",
  authMiddleware,
  requirePermission("payments.read"),
  getAllPayments
);

// GET PAYMENT BY ID
router.get(
  "/:id",
  authMiddleware,
  requirePermission("payments.read"),
  getPaymentById
);

module.exports = router;