/** id string pk
  comment ObjectId comments
  createdAt Date
  video ObjectId videos
  updatedAt Date
  likedBy ObjectId users
  tweet ObjectId tweets */

import mongoose from "mongoose";
import { Schema } from "mongoose";
import { Video } from "./video.models";

const likeSchema = new Schema(
  {
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    tweet: {
      type: Schema.Types.ObjectId,
      ref: "Tweet",
    },
    likeBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Like = mongoose.model("like", likeSchema);
