import ApiError from "../../common/errors/apiError.js";
import ApiResponse from "../../common/utils/apiResponse.js";
import asyncHandler from "../../common/utils/asyncHandler.js";

import { createChannelSchema,updateChannelSchema } from "./channel.validator.js";
import { createChannel,
    getChannelByHandle,
    getMyChannel,
    updateMyChannel
 } from "./channel.service.js";

export const create = asyncHandler(async (req, res) => {
  const result = createChannelSchema.safeParse(req.body);

  if (!result.success) {
    throw new ApiError(
      400,
      "Validation failed",
      result.error.flatten().fieldErrors,
    );
  }

  const channel = await createChannel(req.user.id, result.data);

  return res
    .status(201)
    .json(new ApiResponse(201, channel, "Channel created successfully"));
});

export const getByHandle = asyncHandler(async (req, res) => {
  const channel = await getChannelByHandle(req.params.handle);

  return res
    .status(200)
    .json(new ApiResponse(200, channel, "Channel fetched successfully"));
});

export const getMe = asyncHandler(async (req, res) => {
  const channel = await getMyChannel(req.user.id);

  return res
    .status(200)
    .json(new ApiResponse(200, channel, "Channel fetched successfully"));
});

export const updateMe = asyncHandler(async (req, res) => {
  const result = updateChannelSchema.safeParse(req.body);

  if (!result.success) {
    throw new ApiError(
      400,
      "Validation failed",
      result.error.flatten().fieldErrors,
    );
  }

  if (Object.keys(result.data).length === 0) {
    throw new ApiError(400, "At least one field is required");
  }

  const channel = await updateMyChannel(req.user.id, result.data);

  return res
    .status(200)
    .json(new ApiResponse(200, channel, "Channel updated successfully"));
});