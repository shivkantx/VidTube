import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js";
import { Subscription } from "../models/subscription.models.js";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get Channel Stats
const getChannelStats = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channelId");
  }

  // Count total videos uploaded by this channel
  const totalVideos = await Video.countDocuments({ owner: channelId });

  // Total views across all channel's videos
  const videos = await Video.find({ owner: channelId });
  const totalViews = videos.reduce((sum, video) => sum + (video.views || 0), 0);

  // Total likes on all videos of this channel
  const totalLikes = await Like.countDocuments({
    video: { $in: videos.map((v) => v._id) },
  });

  // Total subscribers of this channel
  const totalSubscribers = await Subscription.countDocuments({
    channel: channelId,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalVideos,
        totalViews,
        totalLikes,
        totalSubscribers,
      },
      "Channel stats fetched successfully"
    )
  );
});

// Get all Channel Videos
const getChannelVideos = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channelId");
  }

  const videos = await Video.find({ owner: channelId })
    .sort({ createdAt: -1 })
    .populate("owner", "username fullname avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Channel videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
