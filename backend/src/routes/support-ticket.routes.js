const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");
const requirePermission = require("../middleware/permission.middleware");
const validate = require("../middleware/validation.middleware");

const {
  createSupportTicketSchema,
  updateSupportTicketSchema,
  createSupportMessageSchema,
} = require("../validators/support-ticket.validator");

const {
  createSupportTicket,
  getAllSupportTickets,
  getSupportTicketById,
  updateSupportTicket,
  addSupportMessage,
} = require("../controllers/support-ticket.controller");

const router = express.Router();

// Create ticket
router.post(
  "/",
  authMiddleware,
  requirePermission("customers.manage"),
  validate(createSupportTicketSchema),
  createSupportTicket
);

// Get all tickets
router.get(
  "/",
  authMiddleware,
  requirePermission("customers.read"),
  getAllSupportTickets
);

// Get ticket by ID
router.get(
  "/:id",
  authMiddleware,
  requirePermission("customers.read"),
  getSupportTicketById
);

// Update ticket
router.put(
  "/:id",
  authMiddleware,
  requirePermission("customers.manage"),
  validate(updateSupportTicketSchema),
  updateSupportTicket
);

// Add message
router.post(
  "/:id/messages",
  authMiddleware,
  requirePermission("customers.manage"),
  validate(createSupportMessageSchema),
  addSupportMessage
);

module.exports = router;