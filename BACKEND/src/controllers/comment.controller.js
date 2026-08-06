import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponses.js";
import jwt from "jsonwebtoken";
import { app } from "../app.js";
import { Video } from "../models/video.model.js";
import { Likes } from "../models/likes.model.js";
import { Comments } from "../models/comments.model.js";
import { Subscription } from "../models/subscription.model.js";

const addComment = asyncHandler( async (req,res) => {
    const { videoId } = req.params;
    if(!videoId)
        throw new ApiError(400,"VIDEO ID IS REQUIRED");
    const { content } = req.body;
    if(!content.trim())
        throw new ApiError(400,"COMMENT CANT BE EMPTY!");

    const comment = await Comments.create({
        video:videoId,
        content:content,
        owner:req.user?._id
    });

    return res
    .status(200)
    .json(
        new ApiResponse(200,comment,"COMMENT ADDED!")
    );
});

const getAllComments = asyncHandler( async (req,res) => {
    const { videoId } = req.params;
    if(!videoId?.trim())
        throw new ApiError(400,"VIDEO ID IS REQUIRED");

    const comments = await Comments.find({video:videoId})
    .populate("owner","_id username avatar") // dont need comments.length>0 it will handle(handles query by query)
    .sort({createdAt:-1});// show the newest comments!!
   
    return res
    .status(200)
    .json(
        new ApiResponse(200,comments,"COMMENTS FETCHED SUCCESSFULLY")
    );
});

const editComment = asyncHandler (async (req,res) => {
    const { commentId } =  req.params;

    if(!commentId?.trim())
        throw new ApiError(400,"COMMENT ID IS REQUIRED");

    const { content } = req.body;
    if(!content?.trim())
        throw new ApiError(400,"COMMENT CANT BE EMPTY");


    const comment = await Comments.findById(commentId);
    if(!comment) throw new ApiError(404,"COMMENT NOT FOUND");
    if(comment.owner.toString() !== req.user._id.toString())
        throw new ApiError(403,"YOU CAN ONLY EDIT YOUR OWN COMMENTS");

    comment.content = content;
    await comment.save();
    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"COMMENT EDITED!")
    );
});

const deleteComment = asyncHandler(async (req,res) => {
    const { commentId } = req.params;
    if(!commentId?.trim())
        throw new ApiError(400,"COMMENT ID IS REQUIRED");

    const comment = await Comments.findById(commentId);
    if(!comment) throw new ApiError(404,"COMMENT NOT FOUND");
    if(comment.owner.toString() !== req.user._id.toString())
        throw new ApiError(403,"YOU CAN'T DELETE OTHERS' COMMENTS");
    
    const deletecomment = await Comments.findByIdAndDelete(commentId);
    if(!deletecomment)
        throw new ApiError(400,"COMMENT CANNOT BE FOUND OR CANNOT BE DELETED");

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"COMMENT DELETED!")
    );
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!commentId?.trim()) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const comment = await Comments.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    const likedAlready = await Likes.findOne({
        comment: commentId,
        likedBy: req.user?._id
    });

    if (likedAlready) {
        await Likes.findByIdAndDelete(likedAlready._id);
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Comment unliked successfully"));
    }

    const newLike = await Likes.create({
        comment: commentId,
        likedBy: req.user?._id
    });

    return res
        .status(200)
        .json(new ApiResponse(200, newLike, "Comment liked successfully"));
});

export {addComment,getAllComments,editComment,deleteComment,toggleCommentLike};