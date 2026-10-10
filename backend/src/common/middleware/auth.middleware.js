import ApiError from "../errors/apiError.js";
import { verifyAccessToken } from "../utils/jwt.js";

const verifyJWT = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  const headerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  const cookieToken = req.cookies?.accessToken;

  const token = cookieToken || headerToken;

  if (!token) {
    throw new ApiError(401, "Authentication required");
  }

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