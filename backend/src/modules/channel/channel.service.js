import { prisma } from "../../config/db.js";
import ApiError from "../../common/errors/apiError.js";

export const createChannel = async (userId, { name, handle, description }) => {
  const existingChannel = await prisma.channel.findFirst({
    where: {
      OR: [{ userId }, { handle }],
    },
    select: {
      id: true,
      userId: true,
      handle: true,
    },
  });

  if (existingChannel) {
    if (existingChannel.userId === userId) {
      throw new ApiError(409, "You already have a channel");
    }

    if (existingChannel.handle === handle) {
      throw new ApiError(409, "Channel handle already exists");
    }
  }

  const channel = await prisma.channel.create({
    data: {
      userId,
      name,
      handle,
      description,
    },
    select: {
      id: true,
      name: true,
      handle: true,
      description: true,
      avatarUrl: true,
      bannerUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return channel;
};

export const getChannelByHandle = async (handle) => {
  const channel = await prisma.channel.findUnique({
    where: {
      handle,
    },
    select: {
      id: true,
      name: true,
      handle: true,
      description: true,
      avatarUrl: true,
      bannerUrl: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });

  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  return channel;
};

export const getMyChannel = async (userId) => {
  const channel = await prisma.channel.findUnique({
    where: {
      userId,
    },
    select: {
      id: true,
      name: true,
      handle: true,
      description: true,
      avatarUrl: true,
      bannerUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  return channel;
};

export const updateMyChannel = async (userId, data) => {
  const existingChannel = await prisma.channel.findUnique({
    where: {
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!existingChannel) {
    throw new ApiError(404, "Channel not found");
  }

  const channel = await prisma.channel.update({
    where: {
      id: existingChannel.id,
    },
    data,
    select: {
      id: true,
      name: true,
      handle: true,
      description: true,
      avatarUrl: true,
      bannerUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return channel;
};