import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { notFoundHandler } from "./common/middleware/notFound.middleware.js";
import { errorHandler } from "./common/middleware/error.middleware.js";

const app = express();

app.disable("x-powered-by");

app.use(helmet());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
  });
});

/*
 * 404 handler must come after all routes.
 */
app.use(notFoundHandler);

/*
 * Global error handler must be the last middleware.
 */
app.use(errorHandler);

export default app;