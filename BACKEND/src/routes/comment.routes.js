import { Router } from "express";
import { addComment, getAllComments, editComment, deleteComment,toggleCommentLike } from "../controllers/comment.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js"
const router = Router();

router.route("/add-comment/:videoId").post(verifyJWT,addComment);
router.route("/get-all-comments/:videoId").get(getAllComments);
router.route("/edit-comment/:commentId").patch(verifyJWT,editComment);
router.route("/delete-comment/:commentId").delete(verifyJWT,deleteComment);
router.route("/toggle-comment-like/:commentId").patch(verifyJWT,toggleCommentLike);

export default router;