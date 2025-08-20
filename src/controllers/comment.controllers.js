import mongoose from "mongoose";
import { Comment } from "../models/comment.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.models.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  // Check video exists
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const options = {
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 10,
    sort: { createdAt: -1 }, // newest first
    populate: {
      path: "owner",
      select: "username email avatar", // only fetch limited fields
    },
  };

  const comments = await Comment.aggregatePaginate(
    Comment.aggregate([
      { $match: { video: new mongoose.Types.ObjectId(videoId) } },
    ]),
    options
  );

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched successfully"));
});

const addComment = async (req, res) => {
  try {
    const { videoId, content } = req.body;
    const userId = req.user._id; // set by auth middleware

    if (!videoId || !content) {
      return res
        .status(400)
        .json({ message: "videoId and content are required" });
    }

    // Check video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Create new comment
    const newComment = new Comment({
      content,
      video: videoId,
      owner: userId,
    });

    await newComment.save();

    return res.status(201).json({
      message: "Comment added successfully",
      comment: newComment,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateComment = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { commentId } = req.params;
  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "Content is required to update");
  }

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid commentId");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (comment.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not allowed to edit this comment");
  }

  comment.content = content;
  await comment.save();

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid commentId");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (comment.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not allowed to edit this comment");
  }

  await comment.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
