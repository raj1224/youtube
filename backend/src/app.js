
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import authRoutes from "./modules/Auth/auth.routes.js";
import errorMiddleware from "./common/middleware/error.middleware.js";

const app = express();

// Security
app.disable("x-powered-by");

// middlewares
app.use(helmet());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);

// Body parsers
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Cookies
app.use(cookieParser());

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
  });
});

// API Routes
app.use("/api/v1/auth", authRoutes);

// Global error handler
// IMPORTANT: This must always be after all routes.
app.use(errorMiddleware);

export default app;
