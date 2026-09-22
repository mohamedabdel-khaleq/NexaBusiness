const { z } = require("zod");

const createCustomerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Customer name is required"),

  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .optional(),

  phone: z
    .string()
    .trim()
    .optional(),

  address: z
    .string()
    .trim()
    .optional(),
});

const updateCustomerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Customer name is required")
    .optional(),

  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .optional(),

  phone: z
    .string()
    .trim()
    .optional(),

  address: z
    .string()
    .trim()
    .optional(),
});

module.exports = {
  createCustomerSchema,
  updateCustomerSchema,
};