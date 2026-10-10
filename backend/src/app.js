import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { env } from "./config/env.js";

import authRoutes from "./modules/auth/auth.routes.js";
import errorMiddleware from "./common/middleware/error.middleware.js";

const app = express();

app.disable("x-powered-by");

app.use(helmet());

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  }),
);

app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
  });
});

app.use("/api/v1/auth", authRoutes);

app.use(errorMiddleware);

export default app;