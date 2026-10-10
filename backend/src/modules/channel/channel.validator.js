import { z } from "zod";

export const createChannelSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Channel name must be at least 2 characters")
    .max(50, "Channel name must be at most 50 characters"),

  handle: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Handle must be at least 3 characters")
    .max(30, "Handle must be at most 30 characters")
    .regex(
      /^[a-z0-9_]+$/,
      "Handle can only contain lowercase letters, numbers and underscores",
    ),

  description: z
    .string()
    .trim()
    .max(1000, "Description must be at most 1000 characters")
    .optional(),
});

export const updateChannelSchema = createChannelSchema.partial();