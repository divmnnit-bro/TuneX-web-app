import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";

import {uploadVideo,getAllVideos,getMyVideos,getVideobyId,updateVideoDetails,deleteVideo,togglePublishStatus,getChannelVideos,
getSubscribedChannelVideos} from "../controllers/video.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js"
const router = Router();
router.route("/").get(getAllVideos);
router.route("/my-videos").get(verifyJWT, getMyVideos); 
router.route("/upload").post(verifyJWT,
    upload.fields([
        {name:"video", maxCount:1},
        {name:"thumbnail", maxCount:1}
    ]),uploadVideo
);
router.route("/v/:videoId")
    .get(verifyJWT,getVideobyId)
    .patch(upload.single("thumbnail"),updateVideoDetails)
    .delete(deleteVideo);
router.route("/toggle-publish-status/:videoId").patch(verifyJWT,togglePublishStatus);
router.route("/channel/:username").get(getChannelVideos);
router.route("/subscribed-channels-videos").get(verifyJWT,getSubscribedChannelVideos);

export default router;
