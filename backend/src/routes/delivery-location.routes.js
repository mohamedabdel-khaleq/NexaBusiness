const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");
const requirePermission = require("../middleware/permission.middleware");
const validate = require("../middleware/validation.middleware");

const {
  updateDriverLocationSchema,
} = require("../validators/delivery-location.validator");

const {
  updateDriverLocation,
} = require("../controllers/delivery-location.controller");

const router = express.Router();

// UPDATE DRIVER LOCATION
router.put(
  "/:driverId/location",
  authMiddleware,
  requirePermission("employees.manage"),
  validate(updateDriverLocationSchema),
  updateDriverLocation
);

module.exports = router;