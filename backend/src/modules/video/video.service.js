import { prisma } from "../../config/db.js";
import ApiError from "../../common/errors/apiError.js";

export const createVideo = async (
  userId,
  { title, description, visibility },
) => {
  // 1. Find the channel owned by the logged-in user
  const channel = await prisma.channel.findUnique({
    where: {
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!channel) {
    throw new ApiError(
      404,
      "Create a channel before uploading a video",
    );
  }

  // 2. Create the video
  const video = await prisma.video.create({
    data: {
      channelId: channel.id,
      title,
      description,
      visibility,

      // Explicitly set initial state
      status: "DRAFT",
    },

    select: {
      id: true,
      channelId: true,
      title: true,
      description: true,
      status: true,
      visibility: true,
      duration: true,
      thumbnailUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return video;
};