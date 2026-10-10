import { Prisma } from "@prisma/client";

import ApiError from "../errors/apiError.js";

const errorMiddleware = (err, req, res, _next) => {
  console.error("❌ Error:", err);

  // Prisma unique constraint violation
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const target = err.meta?.target;

      if (Array.isArray(target)) {
        if (target.includes("username")) {
          return res.status(409).json({
            success: false,
            message: "Username already exists",
          });
        }

        if (target.includes("email")) {
          return res.status(409).json({
            success: false,
            message: "Email already exists",
          });
        }
      }

      return res.status(409).json({
        success: false,
        message: "Resource already exists",
      });
    }
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  return res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message || "Internal server error",
  });
};

export default errorMiddleware;