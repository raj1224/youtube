import "dotenv/config";

import app from "./app.js";
import { prisma } from "./config/db.js";
import { connectRedis, disconnectRedis } from "./config/redis.js";
import {
  connectKafka,
  disconnectKafka,
} from "./config/kafka.js";

const PORT = Number(process.env.PORT) || 8000;

const startServer = async () => {
  try {
    await prisma.$connect();

    console.log("🗄️ PostgreSQL connected");

    await connectRedis();
    await connectKafka();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    const shutdown = async (signal) => {
      console.log(`\n${signal} received. Shutting down...`);

      server.close(async () => {
        await prisma.$disconnect();
        await disconnectRedis();
        await disconnectKafka();

        console.log("HTTP server closed.");
        console.log("Database connection closed.");

        process.exit(0);
      });
    };

    process.on("SIGTERM", () => void shutdown("SIGTERM"));
    process.on("SIGINT", () => void shutdown("SIGINT"));
  } catch (error) {
    console.error("❌ Failed to start server:", error);

    await prisma.$disconnect();
    process.exit(1);
  }
};

void startServer();