import { toggleSubscription } from "../controllers/subscription.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"
const router = Router();

router.route("/toggle-sub/:channelId").patch(verifyJWT,toggleSubscription);

export default router;