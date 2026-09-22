const { z } = require("zod");

const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name is required"),

  description: z
    .string()
    .trim()
    .optional(),
});

const updateCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name is required")
    .optional(),

  description: z
    .string()
    .trim()
    .optional(),
});

module.exports = {
  createCategorySchema,
  updateCategorySchema,
};