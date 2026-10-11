import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce
    .number()
    .int()
    .positive()
    .default(8000),

  CORS_ORIGIN: z
    .string()
    .url(),

  DATABASE_URL: z
    .string()
    .min(1),

  REDIS_URL: z
    .string()
    .min(1),

  KAFKA_BROKERS: z
    .string()
    .min(1),

  KAFKA_CLIENT_ID: z
    .string()
    .min(1),
  JWT_ACCESS_SECRET: z
  .string()
  .min(32),

  JWT_REFRESH_SECRET: z
  .string()
  .min(32),

  JWT_ACCESS_EXPIRES_IN: z
  .string()
  .min(1),

  JWT_REFRESH_EXPIRES_IN: z
  .string()
  .min(1),

  COOKIE_SECURE: z
  .enum(["true", "false"])
  .default("false")
  .transform((value) => value === "true"),

COOKIE_SAME_SITE: z
  .enum(["lax", "strict", "none"])
  .default("lax"),

  S3_REGION: z.string().min(1),
S3_BUCKET: z.string().min(1),
S3_ACCESS_KEY_ID: z.string().min(1),
S3_SECRET_ACCESS_KEY: z.string().min(1),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("❌ Invalid environment variables:");
  console.error(result.error.flatten().fieldErrors);

  process.exit(1);
}

export const env = result.data;