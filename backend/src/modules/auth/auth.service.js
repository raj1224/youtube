import bcrypt from "bcrypt";
import { prisma } from "../../config/db.js";
import ApiError from "../../common/errors/apiError.js";

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from "../../common/utils/jwt.js";

import { hashToken } from "../../common/utils/hash.js";

const SALT_ROUNDS = 12;

export const registerUser = async ({ username, email, password }) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
    select: {
      id: true,
      username: true,
      email: true,
    },
  });

  if (existingUser) {
    if (existingUser.username === username) {
      throw new ApiError(409, "Username already exists");
    }

    if (existingUser.email === email) {
      throw new ApiError(409, "Email already exists");
    }
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
    },
    select: {
      id: true,
      username: true,
      email: true,
      createdAt: true,
    },
  });

  return user;
};

export const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.passwordHash,
  );

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const accessToken = generateAccessToken({
    sub: user.id,
  });

  const refreshToken = generateRefreshToken({
    sub: user.id,
  });

  const tokenHash = hashToken(refreshToken);

  await prisma.refreshToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000,
      ),
    },
  });

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
    accessToken,
    refreshToken,
  };
};

export const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      username: true,
      email: true,
      createdAt: true,
      channel: {
        select: {
          id: true,
          name: true,
          handle: true,
          description: true,
          avatarUrl: true,
          bannerUrl: true,
        },
      },
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

export const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new ApiError(401, "Refresh token required");
  }

  let decoded;

  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  if (!decoded?.sub) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const tokenHash = hashToken(refreshToken);

  const storedToken = await prisma.refreshToken.findUnique({
    where: {
      tokenHash,
    },
  });

  if (!storedToken) {
    throw new ApiError(401, "Invalid refresh token");
  }

  if (storedToken.revokedAt) {
    throw new ApiError(401, "Refresh token has been revoked");
  }

  if (storedToken.expiresAt <= new Date()) {
    throw new ApiError(401, "Refresh token has expired");
  }

  if (storedToken.userId !== decoded.sub) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: decoded.sub,
    },
    select: {
      id: true,
      username: true,
      email: true,
    },
  });

  if (!user) {
    throw new ApiError(401, "User no longer exists");
  }

  // Revoke old refresh token.
  await prisma.refreshToken.update({
    where: {
      id: storedToken.id,
    },
    data: {
      revokedAt: new Date(),
    },
  });

  // Generate new token pair.
  const accessToken = generateAccessToken({
    sub: user.id,
  });

  const newRefreshToken = generateRefreshToken({
    sub: user.id,
  });

  const newTokenHash = hashToken(newRefreshToken);

  await prisma.refreshToken.create({
    data: {
      tokenHash: newTokenHash,
      userId: user.id,
      expiresAt: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000,
      ),
    },
  });

  return {
    user,
    accessToken,
    refreshToken: newRefreshToken,
  };
};

export const logoutUser = async (refreshToken) => {
  if (!refreshToken) {
    return;
  }

  const tokenHash = hashToken(refreshToken);

  await prisma.refreshToken.updateMany({
    where: {
      tokenHash,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
};