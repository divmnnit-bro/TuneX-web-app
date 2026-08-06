import { Router } from "express";
import { chatWithAgent } from "../controllers/agent.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.route("/chat").post(verifyJWT, chatWithAgent);

export default router;