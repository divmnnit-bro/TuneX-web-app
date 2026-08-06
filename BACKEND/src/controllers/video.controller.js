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
import mongoose from "mongoose";

const uploadVideo = asyncHandler( async (req,res) => {
    console.time('total-upload-request');

    const { title,description } = req.body;
    if(!title || !description)
        throw new ApiError(404,"TITLE AND DESCRIPTION ARE REQUIRED");

    const videoLocalPath = req.files?.video[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    
    if(!videoLocalPath || !thumbnailLocalPath)
        throw new ApiError(404,"VIDEO AND THUMBNAIL IS MISSING");

    console.log("Starting video upload to Cloudinary...");
    const videoUpload = await uploadOnCloudinary(videoLocalPath);
    console.log("VIDEO UPLOAD RESULT:", videoUpload);
    console.log("Video upload finished:", videoUpload ? "success" : "FAILED (null)");

    console.log("Starting thumbnail upload to Cloudinary...");
    const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath);
    console.log("THUMBNAIL UPLOAD RESULT:", thumbnailUpload);
    
    console.log("Thumbnail upload finished:", thumbnailUpload ? "success" : "FAILED (null)");

    if(!videoUpload || !thumbnailUpload)
        throw new ApiError(404,"UPLOAD FAILED,TRY AGAIN!");

    const video = await Video.create({
    videoFile: videoUpload.secure_url,
    thumbnail: thumbnailUpload.secure_url,
    title: title,
    description: description,
    duration: videoUpload.duration || 0,
    owner: req.user?._id,
});

    console.timeEnd('total-upload-request');
    return res
    .status(201)
    .json(
        new ApiResponse(200,video,"VIDEO UPLOADED SUCCESSFULLY")
    );
});

const getAllVideos = asyncHandler( async (req,res) => {
  const { query } = req.query;
  const filter = {isPublished:true};

  if(query?.trim())
    filter.title = { $regex: query.trim(), $options:"i"};

  const videos = await Video.find(filter)
  .sort({createdAt:-1})
  .populate("owner", "username fullname avatar");

  return res
    .status(200)
    .json(
        new ApiResponse(200,videos,"Videos Fetched Successfully!")
    );
});


const getMyVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    const videos = await Video.find({ owner: userId })
        .sort({ createdAt: -1 });

    return res
    .status(200)
    .json(
        new ApiResponse(200, videos, "YOUR VIDEOS FETCHED SUCCESSFULLY")
    );
});

const getVideobyId = asyncHandler( async (req,res) => {
    const { videoId } = req.params;
    if(!videoId?.trim())
        throw new ApiError(400,"VIDEO DOESNT EXIST");

    let viewedVideos = {};
    const viewCookie = req.cookies?.viewedVideos;

    if (viewCookie) {
        try {
            viewedVideos = JSON.parse(viewCookie);
        } catch (error) {
            viewedVideos = {};
        }
    }

    const now = Date.now();
    const viewWindowMs = 30 * 60 * 1000;
    const lastViewedAt = viewedVideos[videoId];
    const shouldIncrementViews = !lastViewedAt || (now - lastViewedAt) > viewWindowMs;

    if (shouldIncrementViews) {
        viewedVideos[videoId] = now;
    }

    let video;
    if (shouldIncrementViews) {
        video = await Video.findByIdAndUpdate(
            videoId,
            {
                $inc:{views:0.5}
            },
            {
                new:true
            }
        ).populate("owner","username fullname avatar");
    } else {
        video = await Video.findById(videoId).populate("owner","username fullname avatar");
    }

    if(!video)
        throw new ApiError(404,"VIDEO NOT FOUND");

    res.cookie("viewedVideos", JSON.stringify(viewedVideos), {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "lax"
    });

    let isSubscribed = false;
    let isLiked = false;

    if (req.user?._id) {
        const existingSub = await Subscription.findOne({
            subscriber: req.user._id,
            channel: video.owner._id
        });
        isSubscribed = !!existingSub;

        const existingLike = await Likes.findOne({
            video: videoId,
            likedBy: req.user._id
        });
        isLiked = !!existingLike;
    }
    const videoResponse = video.toObject();
    videoResponse.owner.isSubscribed = isSubscribed;
    videoResponse.isLiked = isLiked;

    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $addToSet:{watchHistory:videoId}
        },
        { new: true }
    );
    return res
    .status(200)
    .json(
        new ApiResponse(200,videoResponse,"VIDEO FETCHED SUCCESSFULLY")
    );
});

const updateVideoDetails = asyncHandler( async (req,res) => {
   
    const {videoId} = req.params;
    const { title, description } = req.body;
    const thumbnailLocalPath = req.file?.path;

    if(!videoId?.trim())
        throw new ApiError(400,"VIDEO ID IS REQUIRED");

    if(!title && !description && !thumbnailLocalPath)
        throw new ApiError(400,"ATLEAST ONE FILE IS REQUIRED");

    const updateFields = {};
    if(title) updateFields.title = title;
    if(description) updateFields.description = description;

    if(thumbnailLocalPath)
    {
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        if(!thumbnail)
            throw new ApiError(400,"FAILED TO UPLOAD THUMBNAIL..TRY AGAIN");
        updateFields.thumbnail = thumbnail.url;
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:updateFields
        },
        { 
        new : true 
        }
    );
    if(!video)
        throw new ApiError(400,"UNABLE TO UPDATE VIDEO DETAILS");

    return res
    .status(200)
    .json(
        new ApiResponse(200,video,"UPDATED SUCCESSFULLY")
    );
});

const deleteVideo = asyncHandler( async (req,res) => {
    const { videoId } = req.params;
    if(!videoId?.trim())
        throw new ApiError(400,"VIDEO ID IS REQUIRED");

    const deleteVideo = await Video.findByIdAndDelete(videoId);

    if(!deleteVideo)
        throw new ApiError(404,"UNABLE TO FIND VIDEO");

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"VIDEO DELETED SUCCESSFULLY")
    );
});

const togglePublishStatus = asyncHandler( async (req,res) => {
    const { videoId } = req.params;
    if(!videoId?.trim())
        throw new ApiError(400,"VIDEO ID IS REQUIRED");

    const video = await Video.findById(videoId);
    if(!video)
        throw new ApiError(404,"VIDEO NOT FOUND");
    video.isPublished = !video.isPublished;
    //dont forget to save!!
    await video.save({validateBeforeSave:false});

    return res
    .status(200)
    .json(
        new ApiResponse(200,{isPublished:video.isPublished},"VIDEO VISIBILITY STATUS UPDATED!")
    );
});

const getChannelVideos = asyncHandler( async (req,res) => {
    const { username } = req.params;
    const user = await User.findOne({username:username.toLowerCase()});
    if(!user)
        throw new ApiError(400,"CHANNEL NOT FOUND");

    const videos = await Video.find({
        owner:user._id,
        isPublished:true
    }).sort({createdAt:-1});

    return res
    .status(200)
    .json(
        new ApiResponse(200,videos,"VIDEOS FETCHED!")
    )
});  

const getSubscribedChannelVideos = asyncHandler( async (req,res) => {
    const userid = req.user?._id;
    if(!userid)
        throw new ApiError(401,"UNAUTHORIZED REQUEST");

    const feedVideos = await Subscription.aggregate([
        {
            // find out kin channels ko user ne subscribe kiya?
            $match:{
                subscriber: new mongoose.Types.ObjectId(userid)
            },
        },
        {
            $lookup: {
                from:"videos",
                localField:"channel",
                foreignField:"owner",
                as:"videos"
            }
        },// data will be [{channel , owner.. , videos:[1,2,3...]}]
        {
            $unwind: "$videos"
        },// this basically multiplies the channel into its videos and hence from 2d array to 1d array
        {
            $match: {
                "videos.isPublished" :true
            }
        },
        {
            $sort: {
                "videos.createdAt": -1
            }
        },// [ {channel wgerah other info + video object}]
        {
            $group:{
                _id:null,
                allVideos:{ $push: "$videos"}
            }// after group and _id=null means put all things in 1 array...and push videos so
        },// our data will look like=> [{_id:null,allvideos:[video1,video2,...]}]
        {
            $project: {
                _id: 0,
                allVideos: 1
            }
        }
    ]);

    const result = feedVideos.length>0 ?feedVideos[0].allVideos:[];

    return res
    .status(200)
    .json(
        new ApiResponse(200,result,"SUBSCRIBED CHANNELS VIDEOS FETCHED!")
    );
});

export {uploadVideo,getAllVideos,getMyVideos,getVideobyId,updateVideoDetails,deleteVideo,togglePublishStatus,getChannelVideos,getSubscribedChannelVideos};