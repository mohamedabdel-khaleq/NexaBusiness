const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");
const requirePermission = require("../middleware/permission.middleware");

const {
  getDeliveryTracking,
} = require("../controllers/delivery-tracking.controller");

const router = express.Router();

// GET DELIVERY TRACKING
router.get(
  "/:id/tracking",
  authMiddleware,
  requirePermission("sales.read"),
  getDeliveryTracking
);

module.exports = router;