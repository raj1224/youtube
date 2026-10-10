import { registerSchema } from "./auth.validator.js";
import { registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  refreshAccessToken,

 } from "./auth.service.js";
import { loginSchema } from "./auth.validator.js";


import { env } from "../../config/env.js";

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

  const { user, accessToken, refreshToken } =
    await loginUser(result.data);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    path: "/",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    path: "/api/v1/auth",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user,
      },
      "Login successful",
    ),
  );
});

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  await logoutUser(refreshToken);

  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    path: "/",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    path: "/api/v1/auth",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Logout successful"));
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.user.id);

  return res.status(200).json(
    new ApiResponse(
      200,
      { user },
      "Current user fetched successfully",
    ),
  );
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  const data = await refreshAccessToken(refreshToken);

  res.cookie("accessToken", data.accessToken, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    path: "/",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", data.refreshToken, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    path: "/api/v1/auth",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: data.user,
      },
      "Access token refreshed successfully",
    ),
  );
});