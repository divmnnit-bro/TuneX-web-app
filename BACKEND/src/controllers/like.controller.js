import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponses.js";
import { Video } from "../models/video.model.js";
import { Likes } from "../models/likes.model.js";
import mongoose from "mongoose";

const toggleLikes = asyncHandler( async (req,res) => {
    const { videoId } = req.params;
    if(!videoId?.trim())
        throw new ApiError(400,"VIDEO ID IS REQUIRED");
    if (!mongoose.isValidObjectId(videoId))
        throw new ApiError(400, "INVALID VIDEO ID");

    const videoExists = await Video.findById(videoId);
    if (!videoExists)
        throw new ApiError(404, "VIDEO NOT FOUND");

    const alreadyLiked = await Likes.findOne({
        video:videoId,
        likedBy:req.user?._id
    });

    let updatedVideo;

    if(alreadyLiked){
        await Likes.findByIdAndDelete(alreadyLiked._id);
        updatedVideo = await Video.findByIdAndUpdate(
            videoId,
            { $inc: { likesCount: -1 } },
            { new: true }
        );

        return res
        .status(200)
        .json(
            new ApiResponse(200,{isLiked:false, likesCount: updatedVideo.likesCount},"VIDEO LIKE REMOVED!")
        );
    }

    await Likes.create({
        video:videoId,
        likedBy:req.user?._id
    });

    updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $inc: { likesCount: 1 } },
        { new: true }
    );

    return res
    .status(200)
    .json(
        new ApiResponse(200,{isLiked:true, likesCount: updatedVideo.likesCount},"VIDEO LIKED!")
    )
});

export {toggleLikes};