const express = require("express");

const {
  createCustomer,
  getAllCustomers,
  getCustomerById,
} = require("../controllers/customer.controller");

const authMiddleware = require("../middleware/auth.middleware");
const requirePermission = require("../middleware/permission.middleware");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  requirePermission("customers.manage"),
  createCustomer
);

router.get(
  "/",
  authMiddleware,
  requirePermission("customers.read"),
  getAllCustomers
);

router.get(
  "/:id",
  authMiddleware,
  requirePermission("customers.read"),
  getCustomerById
);

module.exports = router;