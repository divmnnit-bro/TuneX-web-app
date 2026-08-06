import { Playlist } from "../models/playlist.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponses.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name } = req.body;

    if (!name) {
        throw new ApiError(400, "Name is required");
    }

    const playlist = await Playlist.create({
        name,
        owner: req.user?._id,
        videos: []
    });

    return res
        .status(201)
        .json(new ApiResponse(201, playlist, "Playlist created successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!playlistId) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    const playlist = await Playlist.findById(playlistId).populate({
        path: "videos",
        select: "title thumbnail duration views owner",
        populate: {
            path: "owner",
            select: "username avatar fullname"
        }
    });

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(400, "Invalid user ID");
    }

    const playlists = await Playlist.find({ owner: userId }).populate(
        "videos",
        "title thumbnail duration views"
    );

    return res
        .status(200)
        .json(new ApiResponse(200, playlists, "User playlists fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!playlistId || !videoId) {
        throw new ApiError(400, "Invalid IDs");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Only the owner can modify this playlist");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet: { videos: videoId }
        },
        { new: true }
    ).populate("videos", "title thumbnail duration views");

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "Video added to playlist"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name } = req.body;

    if (!playlistId || !name) {
        throw new ApiError(400, "Playlist ID and new name are required");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Only the owner can update this playlist");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: { name }
        },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "Playlist updated successfully"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!playlistId || !videoId) {
        throw new ApiError(400, "Invalid IDs");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Only the owner can modify this playlist");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: { videos: videoId }
        },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "Video removed from playlist"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!playlistId) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Only the owner can delete this playlist");
    }

    await Playlist.findByIdAndDelete(playlistId);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Playlist deleted successfully"));
});

export { createPlaylist, getPlaylistById, getUserPlaylists ,addVideoToPlaylist, updatePlaylist, removeVideoFromPlaylist,deletePlaylist};