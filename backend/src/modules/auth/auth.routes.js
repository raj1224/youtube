import { Router } from "express";
import { register,
    login,
    logout,
    getMe,
    refresh,
 } from "./auth.controller.js";
import verifyJWT from "../../common/middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", verifyJWT, getMe);

export default router;