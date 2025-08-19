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

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  // Fetch video from DB by ID
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

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

  // Build update object
  const updateFields = {};

  if (title) updateFields.title = title;
  if (description) updateFields.description = description;

  // Handle file uploads
  if (req.files?.thumbnail?.[0]) {
    const thumbnailUpload = await uploadOnCloudinary(
      req.files.thumbnail[0].path,
      "image"
    );
    updateFields.thumbnail = thumbnailUpload.secure_url;
  }

  if (req.files?.videoFile?.[0]) {
    const videoUpload = await uploadOnCloudinary(
      req.files.videoFile[0].path,
      "video"
    );
    updateFields.videoFile = videoUpload.secure_url;
    updateFields.duration = videoUpload.duration || video.duration;
  }

  // Check if at least one field is being updated
  if (Object.keys(updateFields).length === 0) {
    throw new ApiError(400, "At least one field is required to update");
  }

  // Single database update
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

const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid video id" });
    }

    const video = await Video.findById(id);
    if (!video) return res.status(404).json({ message: "Video not found" });

    if (String(video.owner) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // Cloudinary cleanup (if you store public_ids)
    const deletes = [];
    if (video.cloudinaryVideoId) {
      deletes.push(
        cloudinary.uploader.destroy(video.cloudinaryVideoId, {
          resource_type: "video",
        })
      );
    }
    if (video.cloudinaryThumbId) {
      deletes.push(
        cloudinary.uploader.destroy(video.cloudinaryThumbId, {
          resource_type: "image",
        })
      );
    }
    if (deletes.length) {
      await Promise.allSettled(deletes);
    }

    await video.deleteOne(); // or Video.findByIdAndDelete(id)
    return res.status(200).json({ message: "Deleted" });
  } catch (err) {
    console.error("deleteVideo error", err);
    return res.status(500).json({ message: "Server error" });
  }
};

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
