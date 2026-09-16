const express = require("express");

const {
  createCustomer,
  getAllCustomers,
  getCustomerById,
} = require("../controllers/customer.controller");

const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", authMiddleware, createCustomer);
router.get("/", authMiddleware, getAllCustomers);
router.get("/:id", authMiddleware, getCustomerById);

module.exports = router;