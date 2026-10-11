import ApiError from "../../common/errors/apiError.js";
import ApiResponse from "../../common/utils/apiResponse.js";
import asyncHandler from "../../common/utils/asyncHandler.js";

import { createVideoSchema } from "./video.validator.js";
import { createVideo } from "./video.service.js";

export const create = asyncHandler(async (req, res) => {
  const result = createVideoSchema.safeParse(req.body);

  if (!result.success) {
    throw new ApiError(
      400,
      "Validation failed",
      result.error.flatten().fieldErrors,
    );
  }

  const video = await createVideo(req.user.id, result.data);

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        video,
        "Video created successfully",
      ),
    );
});