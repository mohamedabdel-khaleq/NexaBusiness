const { z } = require("zod");

const createPaymentSchema = z.object({
  saleId: z.coerce
    .number()
    .int("Sale ID must be an integer")
    .positive("Sale ID must be greater than 0"),

  amount: z.coerce
    .number()
    .positive("Payment amount must be greater than 0"),

  method: z.enum(
    ["CASH", "CARD", "BANK_TRANSFER", "WALLET"],
    {
      message: "Invalid payment method",
    }
  ),
});

module.exports = {
  createPaymentSchema,
};