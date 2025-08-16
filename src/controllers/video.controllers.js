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
  const { title, description } = req.body;
  // TODO: get uploaded video file from req.files or req.file
  const file = req.file;

  if (!file) {
    throw new ApiError(400, "No video file provided");
  }
  // TODO: upload video to Cloudinary
  const uploadVideo = await uploadOnCloudinary(file.path, "viedos");
  const newVideo = await Video.create({});

  // TODO: create video document in MongoDB
  res.json(new ApiResponse(201, "Video published successfully"));
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
