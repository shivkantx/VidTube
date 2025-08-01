/** id string pk
  name string
  description string
  createdAt Date
  updatedAt Date
  videos ObjectId[] videos
  owner ObjectId users */

import mongoose from "mongoose";
import { Schema } from "mongoose";
const playlistSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      typeof: String,
      required: true,
    },
    videos: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Playlist = mongoose.model("Playlist", playlistSchema);
