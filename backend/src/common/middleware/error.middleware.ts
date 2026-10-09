import type { ErrorRequestHandler } from "express";
import { AppError } from "../errors/AppError.js";

export const errorHandler: ErrorRequestHandler = (
  err,
  _req,
  res,
  _next,
) => {
  const isAppError = err instanceof AppError;

  const statusCode = isAppError ? err.statusCode : 500;

  const code = isAppError
    ? err.code
    : "INTERNAL_SERVER_ERROR";

  const message = isAppError
    ? err.message
    : "Something went wrong";

  if (!isAppError) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    },
  });
};