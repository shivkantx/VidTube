import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js"; // ✅ added deleteFromCloudinary
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// GET all videos with optional filters, pagination, sorting
const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  // TODO: implement fetching videos with pagination, filtering, sorting
});

// PUBLISH a new video
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

    // Save to MongoDB with new schema format
    const newVideo = await Video.create({
      title,
      description,
      videoFile: {
        url: videoUpload.secure_url,
        public_id: videoUpload.public_id,
      },
      thumbnail: {
        url: thumbnailUpload.secure_url,
        public_id: thumbnailUpload.public_id,
      },
      duration: videoUpload.duration || 0,
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

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

// UPDATE video details
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body || {};

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  const updateFields = {};

  if (title) updateFields.title = title;
  if (description) updateFields.description = description;

  if (req.files?.thumbnail?.[0]) {
    // delete old thumbnail
    if (video.thumbnailPublicId) {
      await deleteFromCloudinary(video.thumbnailPublicId);
    }
    const thumbnailUpload = await uploadOnCloudinary(
      req.files.thumbnail[0].path
    );
    updateFields.thumbnail = thumbnailUpload.secure_url;
    updateFields.thumbnailPublicId = thumbnailUpload.public_id;
  }

  if (req.files?.videoFile?.[0]) {
    // delete old video
    if (video.videoFilePublicId) {
      await deleteFromCloudinary(video.videoFilePublicId);
    }
    const videoUpload = await uploadOnCloudinary(req.files.videoFile[0].path);
    updateFields.videoFile = videoUpload.secure_url;
    updateFields.videoFilePublicId = videoUpload.public_id;
    updateFields.duration = videoUpload.duration || video.duration;
  }

  if (Object.keys(updateFields).length === 0) {
    throw new ApiError(400, "At least one field is required to update");
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    { $set: updateFields },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: "Video updated successfully",
    data: updatedVideo,
  });
});

// DELETE a video
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this video");
  }

  // Delete from Cloudinary using helper
  if (video.videoFile?.public_id) {
    await deleteFromCloudinary(video.videoFile.public_id, "video");
  }

  if (video.thumbnail?.public_id) {
    await deleteFromCloudinary(video.thumbnail.public_id, "image");
  }

  // Delete DB entry
  await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Video and files deleted successfully"));
});

// TOGGLE publish status
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await Video.findById(videoId);

  if (!video) throw new ApiError(404, "Video not found");

  video.isPublished = !video.isPublished;
  await video.save();

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Publish status toggled"));
});

export {
  getAllVideos,
  uploadVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
