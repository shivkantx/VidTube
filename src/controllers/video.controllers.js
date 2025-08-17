import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// GET all videos with optional filters, pagination, sorting
const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  // TODO: implement fetching videos with pagination, filtering, sorting
});

// PUBLISH a new video
const uploadVideo = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!req.files?.videoFile || !req.files?.thumbnail) {
      return res
        .status(400)
        .json({ message: "Video file and thumbnail are required" });
    }

    // Upload to Cloudinary
    const videoUpload = await uploadOnCloudinary(
      req.files.videoFile[0].path,
      "video"
    );
    const thumbnailUpload = await uploadOnCloudinary(
      req.files.thumbnail[0].path,
      "image"
    );

    if (!videoUpload || !thumbnailUpload) {
      return res
        .status(500)
        .json({ message: "Failed to upload video or thumbnail" });
    }

    // Cloudinary returns duration for videos (in seconds)
    const duration = videoUpload.duration || 0;

    // Save to MongoDB
    const newVideo = await Video.create({
      title,
      description,
      videoFile: videoUpload.secure_url,
      thumbnail: thumbnailUpload.secure_url,
      duration, // ✅ set here
      owner: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Video uploaded successfully",
      data: newVideo,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// GET video by ID
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  // TODO: fetch video by ID from DB
  res.json(new ApiResponse(200, "Video fetched", { videoId }));
});

// UPDATE video details
const updateVideo = asyncHandler(async (req, res) => {
  // fixed typo: upadteVideo -> updateVideo
  const { videoId } = req.params;

  // TODO: update title, description, thumbnail, etc.
  res.json(new ApiResponse(200, "Video updated", { videoId }));
});

// DELETE a video
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  // TODO: delete video document from DB and remove from Cloudinary
  res.json(new ApiResponse(200, "Video deleted", { videoId }));
});

// TOGGLE publish status
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  // TODO: fetch video, toggle isPublished, save
  res.json(new ApiResponse(200, "Publish status toggled", { videoId }));
});

export {
  getAllVideos,
  uploadVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
