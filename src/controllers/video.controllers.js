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
const publishAVideo = asyncHandler(async (req, res) => {
  // Safe body read for multipart/form-data
  const body = req.body || {};
  const title = body.title?.trim();
  const description = body.description?.trim();

  // Validation: Check required fields
  if (!title || !description) {
    throw new ApiError(400, "Title and description are required");
  }

  // Multer .fields puts files on req.files, not req.file
  const videoPart = req.files?.videoFile?.[0] || null;

  if (!videoPart) {
    throw new ApiError(400, "No video file provided");
  }

  let uploadedVideo = null;

  try {
    // Upload video to Cloudinary (adjust helper signature if needed)
    uploadedVideo = await uploadOnCloudinary(videoPart.path, "videos");

    // Support either secure_url or url depending on your helper
    const videoUrl = uploadedVideo?.secure_url || uploadedVideo?.url;
    const publicId = uploadedVideo?.public_id;

    if (!videoUrl) {
      throw new ApiError(500, "Failed to upload video to Cloudinary");
    }

    // Create video document (uses your field names)
    const newVideo = await Video.create({
      title,
      description,
      videoUrl, // your schema expects videoUrl
      uploadedBy: req.user?._id, // your schema expects uploadedBy
    });

    return res
      .status(201)
      .json(new ApiResponse(201, newVideo, "Video published successfully"));
  } catch (error) {
    console.error("Video publish error:", error);

    // Cleanup uploaded asset if DB save fails
    try {
      const publicId = uploadedVideo?.public_id;
      if (publicId) {
        await deleteFromCloudinary(publicId);
      }
    } catch (_) {
      // ignore cleanup errors
    }

    throw new ApiError(500, "Something went wrong while publishing the video");
  }
});

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
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
