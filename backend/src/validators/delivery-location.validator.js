const { z } = require("zod");

const updateDriverLocationSchema = z.object({
  latitude: z.coerce
    .number()
    .min(-90, "Invalid latitude")
    .max(90, "Invalid latitude"),

  longitude: z.coerce
    .number()
    .min(-180, "Invalid longitude")
    .max(180, "Invalid longitude"),
});

module.exports = {
  updateDriverLocationSchema,
};