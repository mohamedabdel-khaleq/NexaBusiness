const { z } = require("zod");

const createDeliveryDriverSchema = z.object({
  name: z.string().trim().min(2, "Driver name must be at least 2 characters"),
  phone: z.string().trim().min(7, "Invalid phone number"),
  vehicleType: z.string().trim().optional(),
  vehicleNumber: z.string().trim().optional(),
  isActive: z.boolean().default(true),
});

const updateDeliveryDriverSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Driver name must be at least 2 characters")
    .optional(),

  phone: z
    .string()
    .trim()
    .min(7, "Invalid phone number")
    .optional(),

  vehicleType: z.string().trim().optional(),
  vehicleNumber: z.string().trim().optional(),
  isActive: z.boolean().optional(),
});

module.exports = {
  createDeliveryDriverSchema,
  updateDeliveryDriverSchema,
};