import { Router } from "express";

import verifyJWT from "../../common/middleware/auth.middleware.js";
import {
  create,
  getByHandle,
  getMe,
  updateMe,
} from "./channel.controller.js";

const router = Router();

// Protected — specific route first
router.get("/me", verifyJWT, getMe);
router.patch("/me", verifyJWT, updateMe);

// Public — dynamic route after specific routes
router.get("/:handle", getByHandle);

// Create channel
router.post("/", verifyJWT, create);

export default router;