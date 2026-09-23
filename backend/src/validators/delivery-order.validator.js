const { z } = require("zod");

const createDeliveryOrderSchema = z.object({
  saleId: z.coerce
    .number()
    .int("Sale ID must be an integer")
    .positive("Sale ID must be greater than 0"),

  driverId: z.coerce
    .number()
    .int("Driver ID must be an integer")
    .positive("Driver ID must be greater than 0")
    .optional(),

  address: z
    .string()
    .trim()
    .min(5, "Delivery address is required"),

  latitude: z.coerce
    .number()
    .min(-90, "Invalid latitude")
    .max(90, "Invalid latitude")
    .optional(),

  longitude: z.coerce
    .number()
    .min(-180, "Invalid longitude")
    .max(180, "Invalid longitude")
    .optional(),

  deliveryFee: z.coerce
    .number()
    .nonnegative("Delivery fee cannot be negative")
    .default(0),

  status: z
    .enum([
      "PENDING",
      "ASSIGNED",
      "PICKED_UP",
      "IN_TRANSIT",
      "DELIVERED",
      "CANCELLED",
    ])
    .default("PENDING"),

  estimatedDeliveryTime: z.coerce.date().optional(),

  notes: z.string().trim().optional(),
});

const updateDeliveryOrderSchema = z.object({
  driverId: z.coerce
    .number()
    .int("Driver ID must be an integer")
    .positive("Driver ID must be greater than 0")
    .nullable()
    .optional(),

  address: z
    .string()
    .trim()
    .min(5, "Delivery address is required")
    .optional(),

  latitude: z.coerce
    .number()
    .min(-90, "Invalid latitude")
    .max(90, "Invalid latitude")
    .optional(),

  longitude: z.coerce
    .number()
    .min(-180, "Invalid longitude")
    .max(180, "Invalid longitude")
    .optional(),

  deliveryFee: z.coerce
    .number()
    .nonnegative("Delivery fee cannot be negative")
    .optional(),

  status: z
    .enum([
      "PENDING",
      "ASSIGNED",
      "PICKED_UP",
      "IN_TRANSIT",
      "DELIVERED",
      "CANCELLED",
    ])
    .optional(),

  estimatedDeliveryTime: z.coerce.date().optional(),

  notes: z.string().trim().optional(),
});

module.exports = {
  createDeliveryOrderSchema,
  updateDeliveryOrderSchema,
};