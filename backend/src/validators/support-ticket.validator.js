const { z } = require("zod");

const createSupportTicketSchema = z.object({
  customerId: z.coerce
    .number()
    .int("Customer ID must be an integer")
    .positive("Customer ID must be greater than 0"),

  subject: z
    .string()
    .trim()
    .min(3, "Subject must be at least 3 characters"),

  description: z
    .string()
    .trim()
    .min(5, "Description must be at least 5 characters"),

  priority: z
    .enum(["LOW", "MEDIUM", "HIGH", "URGENT"])
    .default("MEDIUM"),
});

const updateSupportTicketSchema = z.object({
  status: z
    .enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"])
    .optional(),

  priority: z
    .enum(["LOW", "MEDIUM", "HIGH", "URGENT"])
    .optional(),

  subject: z
    .string()
    .trim()
    .min(3, "Subject must be at least 3 characters")
    .optional(),

  description: z
    .string()
    .trim()
    .min(5, "Description must be at least 5 characters")
    .optional(),
});

const createSupportMessageSchema = z.object({
  sender: z
    .string()
    .trim()
    .min(2, "Sender is required"),

  message: z
    .string()
    .trim()
    .min(1, "Message is required"),
});

module.exports = {
  createSupportTicketSchema,
  updateSupportTicketSchema,
  createSupportMessageSchema,
};