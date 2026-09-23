const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");
const requirePermission = require("../middleware/permission.middleware");
const validate = require("../middleware/validation.middleware");

const {
  createDeliveryDriverSchema,
  updateDeliveryDriverSchema,
} = require("../validators/delivery-driver.validator");

const {
  createDeliveryDriver,
  getAllDeliveryDrivers,
  getDeliveryDriverById,
  updateDeliveryDriver,
  deleteDeliveryDriver,
} = require("../controllers/delivery-driver.controller");

const router = express.Router();

// CREATE DRIVER
router.post(
  "/",
  authMiddleware,
  requirePermission("employees.manage"),
  validate(createDeliveryDriverSchema),
  createDeliveryDriver
);

// GET ALL DRIVERS
router.get(
  "/",
  authMiddleware,
  requirePermission("employees.read"),
  getAllDeliveryDrivers
);

// GET DRIVER BY ID
router.get(
  "/:id",
  authMiddleware,
  requirePermission("employees.read"),
  getDeliveryDriverById
);

// UPDATE DRIVER
router.put(
  "/:id",
  authMiddleware,
  requirePermission("employees.manage"),
  validate(updateDeliveryDriverSchema),
  updateDeliveryDriver
);

// DELETE DRIVER
router.delete(
  "/:id",
  authMiddleware,
  requirePermission("employees.manage"),
  deleteDeliveryDriver
);

module.exports = router;