import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.models.js";
import { Tweet } from "../models/tweet.models.js";
import { Video } from "../models/video.models.js";
import { Comment } from "../models/comment.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  // Check Valid Tweet or not
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  // Check video exist or not
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Check already liked by existing user or not
  const existingLike = await Like.findOne({ video: videoId, likeBy: userId });

  if (existingLike) {
    await existingLike.deleteOne();

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Video unliked successfully"));
  }

  const like = await Like.create({ video: videoId, likeBy: userId });
  return res
    .status(201)
    .json(new ApiResponse(201, like, "Video liked successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  // Check Valid comment or not
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid commentId");
  }

  // Check comment exist or not
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  // check already liked by existing user or not if not then dislike it
  const existingLike = await Like.findOne({
    comment: commentId,
    likeBy: userId,
  });

  if (existingLike) {
    await existingLike.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Comment unliked successfully"));
  }

  const like = await Like.create({ comment: commentId, likeBy: userId });
  return res
    .status(201)
    .json(new ApiResponse(201, like, "Comment liked successfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user._id;

  // Check Valid Tweet or not
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweetId");
  }

  // Check tweet exist or not
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  // Check already liked by existing user or not
  const existingLike = await Like.findOne({
    tweet: tweetId,
    likeBy: userId,
  });

  if (existingLike) {
    await existingLike.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Tweet unliked successfully"));
  }

  // ✅ Fix: Save under "tweet" instead of "comment"
  const like = await Like.create({ tweet: tweetId, likeBy: userId });

  return res
    .status(201)
    .json(new ApiResponse(201, like, "Tweet liked successfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Find all likes where the user liked a video
  const likedVideos = await Like.find({
    likeBy: userId,
    video: { $exists: true },
  })
    .populate("video") // populate video details
    .select("video -_id"); // only return video field, hide Like _id

  if (!likedVideos || likedVideos.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No liked videos found"));
  }

  // Extract just the video objects
  const videos = likedVideos.map((like) => like.video);

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Liked videos fetched successfully"));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
