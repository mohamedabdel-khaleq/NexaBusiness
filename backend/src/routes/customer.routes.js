const express = require("express");

const validate = require("../middleware/validation.middleware");

const {
  createCustomerSchema,
  updateCustomerSchema,
} = require("../validators/customer.validator");

const {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customer.controller");

const authMiddleware = require("../middleware/auth.middleware");
const requirePermission = require("../middleware/permission.middleware");

const router = express.Router();

// CREATE CUSTOMER

router.post(
  "/",
  authMiddleware,
  requirePermission("customers.manage"),
  validate(createCustomerSchema),
  createCustomer
);

// GET ALL CUSTOMERS

router.get(
  "/",
  authMiddleware,
  requirePermission("customers.read"),
  getAllCustomers
);

// GET CUSTOMER BY ID

router.get(
  "/:id",
  authMiddleware,
  requirePermission("customers.read"),
  getCustomerById
);

// UPDATE CUSTOMER

router.put(
  "/:id",
  authMiddleware,
  requirePermission("customers.manage"),
  validate(updateCustomerSchema),
  updateCustomer
);

// DELETE CUSTOMER

router.delete(
  "/:id",
  authMiddleware,
  requirePermission("customers.manage"),
  deleteCustomer
);

module.exports = router;