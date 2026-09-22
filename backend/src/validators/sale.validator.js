const { z } = require("zod");

const saleItemSchema = z.object({
  productId: z.coerce
    .number()
    .int("Product ID must be an integer")
    .positive("Product ID must be greater than 0"),

  quantity: z.coerce
    .number()
    .int("Quantity must be an integer")
    .positive("Quantity must be greater than 0"),

  unitPrice: z.coerce
    .number()
    .positive("Unit price must be greater than 0"),
});

const createSaleSchema = z.object({
  customerId: z.coerce
    .number()
    .int("Customer ID must be an integer")
    .positive("Customer ID must be greater than 0"),

  items: z
    .array(saleItemSchema)
    .min(1, "Sale must contain at least one item"),
});

module.exports = {
  createSaleSchema,
};