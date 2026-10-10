import { createClient } from "redis";

import { env } from "./env.js";

const redis = createClient({
  url: env.REDIS_URL,
});

redis.on("error", (error) => {
  console.error("❌ Redis error:", error);
});

export const connectRedis = async () => {
  if (!redis.isOpen) {
    await redis.connect();
  }

  console.log("🔴 Redis connected");
};

export const disconnectRedis = async () => {
  if (redis.isOpen) {
    await redis.quit();
    console.log("Redis connection closed.");
  }
};

export default redis;