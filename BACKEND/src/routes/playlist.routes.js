import { createPlaylist, getPlaylistById, getUserPlaylists, addVideoToPlaylist,updatePlaylist,removeVideoFromPlaylist,deletePlaylist,} from "../controllers/playlist.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"
const router = Router();

router.route("/create-playlist").post(verifyJWT,createPlaylist);
router.route("/getUserPlaylists").get(verifyJWT, getUserPlaylists);
router.route("/:playlistId")
    .get(getPlaylistById)
    .patch(verifyJWT,updatePlaylist)
    .delete(verifyJWT,deletePlaylist);
router.route("/add/:playlistId/:videoId").patch(verifyJWT,addVideoToPlaylist);
router.route("/remove/:playlistId/:videoId").patch(verifyJWT,removeVideoFromPlaylist);

export default router;