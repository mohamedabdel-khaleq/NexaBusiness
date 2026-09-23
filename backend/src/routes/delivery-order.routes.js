const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");
const requirePermission = require("../middleware/permission.middleware");
const validate = require("../middleware/validation.middleware");

const {
  createDeliveryOrderSchema,
  updateDeliveryOrderSchema,
} = require("../validators/delivery-order.validator");

const {
  createDeliveryOrder,
  getAllDeliveryOrders,
  getDeliveryOrderById,
  updateDeliveryOrder,
  deleteDeliveryOrder,
} = require("../controllers/delivery-order.controller");

const router = express.Router();

// CREATE DELIVERY ORDER
router.post(
  "/",
  authMiddleware,
  requirePermission("sales.create"),
  validate(createDeliveryOrderSchema),
  createDeliveryOrder
);

// GET ALL DELIVERY ORDERS
router.get(
  "/",
  authMiddleware,
  requirePermission("sales.read"),
  getAllDeliveryOrders
);

// GET DELIVERY ORDER BY ID
router.get(
  "/:id",
  authMiddleware,
  requirePermission("sales.read"),
  getDeliveryOrderById
);

// UPDATE DELIVERY ORDER
router.put(
  "/:id",
  authMiddleware,
  requirePermission("sales.create"),
  validate(updateDeliveryOrderSchema),
  updateDeliveryOrder
);

// DELETE DELIVERY ORDER
router.delete(
  "/:id",
  authMiddleware,
  requirePermission("sales.create"),
  deleteDeliveryOrder
);

module.exports = router;