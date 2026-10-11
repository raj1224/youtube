import { Router } from "express";

import verifyJWT from "../../common/middleware/auth.middleware.js";
import { create } from "./video.controller.js";

const router = Router();

router.post("/", verifyJWT, create);

export default router;