const { z } = require("zod");

const createUserSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),

  email: z.string().trim().email("Invalid email address"),

  password: z.string().min(6, "Password must be at least 6 characters"),

  roleId: z.coerce
    .number()
    .int("Role ID must be an integer")
    .positive("Role ID must be greater than 0"),
});

const updateUserSchema = z.object({
  name: z.string().trim().min(2).optional(),

  email: z.string().trim().email("Invalid email address").optional(),

  password: z.string().min(6, "Password must be at least 6 characters").optional(),

  roleId: z.coerce
    .number()
    .int("Role ID must be an integer")
    .positive("Role ID must be greater than 0")
    .optional(),
});

const updateUserRoleSchema = z.object({
  roleId: z.coerce
    .number()
    .int("Role ID must be an integer")
    .positive("Role ID must be greater than 0"),
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  updateUserRoleSchema,
};