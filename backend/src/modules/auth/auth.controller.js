import { registerSchema } from "./auth.validator.js";
import { registerUser } from "./auth.service.js";
import { loginSchema } from "./auth.validator.js";
import { loginUser } from "./auth.service.js";

import asyncHandler from "../../common/utils/asyncHandler.js";
import ApiError from "../../common/errors/apiError.js";
import ApiResponse from "../../common/utils/apiResponse.js";

export const register = asyncHandler(async (req, res) => {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    throw new ApiError(
      400,
      "Validation failed",
      result.error.flatten().fieldErrors,
    );
  }

  const user = await registerUser(result.data);

  return res
    .status(201)
    .json(new ApiResponse(201, { user }, "User registered successfully"));
});

export const login = asyncHandler(async (req, res) => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    throw new ApiError(
      400,
      "Validation failed",
      result.error.flatten().fieldErrors,
    );
  }

  const data = await loginUser(result.data);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        data,
        "Login successful",
      ),
    );
});