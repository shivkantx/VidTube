// video.models.js

/*
  id string pk
  owner ObjectId users
  videoFile object {
    url string,
    public_id string
  }
  thumbnail object {
    url string,
    public_id string
  }
  title string
  description string
  duration number
  views number
  isPublished boolean
  createdAt Date
  updatedAt Date
*/

import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
  {
    videoFile: {
      url: {
        type: String, // cloudinary url
        required: true,
      },
      public_id: {
        type: String, // cloudinary public id
        required: true,
      },
    },
    thumbnail: {
      url: {
        type: String, // cloudinary url
        required: true,
      },
      public_id: {
        type: String, // cloudinary public id
        required: true,
      },
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// add pagination plugin
videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);
