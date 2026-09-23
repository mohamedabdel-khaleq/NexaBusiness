const { z } = require("zod");

const createProductSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Product name is required"),

    sku: z
      .string()
      .trim()
      .min(1, "SKU is required"),

    barcode: z
      .string()
      .trim()
      .min(1, "Barcode is required")
      .optional(),

    description: z
      .string()
      .trim()
      .optional(),

    price: z
      .coerce
      .number()
      .positive("Price must be greater than 0"),

    costPrice: z
      .coerce
      .number()
      .nonnegative("Cost price cannot be negative"),

    stock: z
      .coerce
      .number()
      .int("Stock must be an integer")
      .nonnegative("Stock cannot be negative"),

    isActive: z
      .boolean()
      .default(true),

    categoryId: z
      .coerce
      .number()
      .int("Category ID must be an integer")
      .positive("Category ID must be greater than 0"),
  })
  .refine(
    (data) => data.costPrice <= data.price,
    {
      message: "Cost price cannot be greater than selling price",
      path: ["costPrice"],
    }
  );

const updateProductSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Product name is required")
      .optional(),

    sku: z
      .string()
      .trim()
      .min(1, "SKU is required")
      .optional(),

    barcode: z
      .string()
      .trim()
      .min(1, "Barcode is required")
      .optional(),

    description: z
      .string()
      .trim()
      .optional(),

    price: z
      .coerce
      .number()
      .positive("Price must be greater than 0")
      .optional(),

    costPrice: z
      .coerce
      .number()
      .nonnegative("Cost price cannot be negative")
      .optional(),

    stock: z
      .coerce
      .number()
      .int("Stock must be an integer")
      .nonnegative("Stock cannot be negative")
      .optional(),

    isActive: z
      .boolean()
      .optional(),

    categoryId: z
      .coerce
      .number()
      .int("Category ID must be an integer")
      .positive("Category ID must be greater than 0")
      .optional(),
  })
  .refine(
    (data) => {
      if (
        data.price !== undefined &&
        data.costPrice !== undefined
      ) {
        return data.costPrice <= data.price;
      }

      return true;
    },
    {
      message: "Cost price cannot be greater than selling price",
      path: ["costPrice"],
    }
  );

module.exports = {
  createProductSchema,
  updateProductSchema,
};