const { z } = require("zod");

const createInventorySchema = z
  .object({
    productId: z
      .coerce
      .number()
      .int("Product ID must be an integer")
      .positive("Product ID must be greater than 0"),

    type: z.enum(
      ["PURCHASE", "SALE", "RETURN", "DAMAGE", "ADJUSTMENT"],
      {
        message: "Invalid inventory transaction type",
      }
    ),

    quantity: z
      .coerce
      .number()
      .int("Quantity must be an integer"),

    note: z
      .string()
      .trim()
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "ADJUSTMENT") {
      if (data.quantity === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["quantity"],
          message: "Adjustment quantity cannot be zero",
        });
      }

      return;
    }

    if (data.quantity <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["quantity"],
        message: "Quantity must be greater than 0",
      });
    }
  });

module.exports = {
  createInventorySchema,
};