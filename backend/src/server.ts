import "dotenv/config";

import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/db.js";

const startServer = async () => {
  try {
    await prisma.$connect();

    console.log("🗄️ PostgreSQL connected");

    const server = app.listen(env.PORT, () => {
      console.log(`🚀 Server running on port ${env.PORT}`);
    });

    const shutdown = async (signal: string) => {
      console.log(`\n${signal} received. Shutting down...`);

      server.close(async () => {
        await prisma.$disconnect();

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