/** id string pk
  owner ObjectId users   -> the user who posted the tweet
  content string         -> the text content of the tweet
  createdAt Date         -> when it was created
  updatedAt Date         -> last update timestamp */

import mongoose, { Schema } from "mongoose";

const tweetSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Tweet = mongoose.model("Tweet", tweetSchema);
