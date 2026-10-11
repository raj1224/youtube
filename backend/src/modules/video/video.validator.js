import { z } from "zod";

export const createVideoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be at most 200 characters"),

  description: z
    .string()
    .trim()
    .max(5000, "Description must be at most 5000 characters")
    .optional(),

  visibility: z
    .enum(["PUBLIC", "UNLISTED", "PRIVATE"])
    .default("PUBLIC"),
});