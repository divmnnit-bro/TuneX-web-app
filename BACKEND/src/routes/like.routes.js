import { Router } from "express";
import { toggleLikes } from "../controllers/like.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js"
const router = Router();

router.route("/toggle-like/:videoId").patch(verifyJWT,toggleLikes);

export default router;