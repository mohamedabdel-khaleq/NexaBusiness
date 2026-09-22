const { z } = require("zod");

const createDepartmentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Department name is required"),

  description: z
    .string()
    .trim()
    .optional(),
});

const updateDepartmentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Department name is required")
    .optional(),

  description: z
    .string()
    .trim()
    .optional(),
});

module.exports = {
  createDepartmentSchema,
  updateDepartmentSchema,
};