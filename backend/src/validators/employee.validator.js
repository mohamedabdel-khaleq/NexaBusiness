const { z } = require("zod");

const createEmployeeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Employee name is required"),

  email: z
    .string()
    .trim()
    .email("Invalid email address"),

  phone: z
    .string()
    .trim()
    .optional(),

  salary: z
    .coerce
    .number()
    .nonnegative("Salary cannot be negative")
    .optional(),

  hireDate: z
    .coerce
    .date({
      message: "Invalid hire date",
    }),

  isActive: z
    .boolean()
    .default(true),

  departmentId: z
    .coerce
    .number()
    .int("Department ID must be an integer")
    .positive("Department ID must be greater than 0"),
});

const updateEmployeeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Employee name is required")
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

  salary: z
    .coerce
    .number()
    .nonnegative("Salary cannot be negative")
    .optional(),

  hireDate: z
    .coerce
    .date({
      message: "Invalid hire date",
    })
    .optional(),

  isActive: z
    .boolean()
    .optional(),

  departmentId: z
    .coerce
    .number()
    .int("Department ID must be an integer")
    .positive("Department ID must be greater than 0")
    .optional(),
});

module.exports = {
  createEmployeeSchema,
  updateEmployeeSchema,
};