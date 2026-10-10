import ApiError from "../errors/apiError.js";
import { verifyAccessToken } from "../utils/jwt.js";

const verifyJWT = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new ApiError(401, "Authentication required");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token);

    if (!decoded?.sub) {
      throw new ApiError(401, "Invalid access token");
    }

    req.user = {
      id: decoded.sub,
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(401, "Invalid or expired access token");
  }
};

export default verifyJWT;