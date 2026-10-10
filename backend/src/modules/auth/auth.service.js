import bcrypt from "bcrypt";
import { prisma } from "../../config/db.js";
import ApiError from "../../common/errors/apiError.js";

import {
  generateAccessToken,
  generateRefreshToken,
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