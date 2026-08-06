import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";

import {registerUser,loginUser,logOutUser,refreshaccessToken,updatePassword,getCurrentUser,updateAccountdetails,
updateUserAvatar,updateUserCoverImage,getUserchannelProfile,getWatchHistory} from "../controllers/user.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js"
const router = Router();

router.route("/register").post(
        upload.fields([
            { name:"avatar",maxCount:1 },
            { name:"coverImage",maxCount:1}
        ]),registerUser);

router.route("/login").post(loginUser);

router.route("/logout").post(verifyJWT,logOutUser);
router.route("/refresh-access-token").post(refreshaccessToken); // refresh Access Token End-Point

router.route("/update-password").post(verifyJWT,updatePassword);

router.route("/get-User").get(verifyJWT,getCurrentUser);

router.route("/update-account-details").patch(verifyJWT,updateAccountdetails);

router.route("/update-avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar);

router.route("/update-cover-image").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage);

router.route("/c/:username").get(verifyJWT,getUserchannelProfile);

router.route("/watch-history").get(verifyJWT,getWatchHistory);

export default router;