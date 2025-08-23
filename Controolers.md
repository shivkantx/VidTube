# VidTube Controllers Documentation - Complete Functions with Explanations

## 1. Video Controller

### 1.1 Upload Video Function

```javascript
const uploadVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "Title and description are required");
  }

  const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoFileLocalPath) {
    throw new ApiError(400, "Video file is required");
  }

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail is required");
  }

  const videoFile = await uploadOnCloudinary(videoFileLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoFile) {
    throw new ApiError(400, "Video file upload failed");
  }

  if (!thumbnail) {
    throw new ApiError(400, "Thumbnail upload failed");
  }

  const video = await Video.create({
    title,
    description,
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    duration: videoFile.duration,
    owner: req.user._id,
    isPublished: true,
  });

  const uploadedVideo = await Video.findById(video._id).populate(
    "owner",
    "username avatar"
  );

  if (!uploadedVideo) {
    throw new ApiError(500, "Something went wrong while uploading video");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, uploadedVideo, "Video uploaded successfully"));
});
```

**Explanation:** This function handles video upload to the platform. It first validates that title and description are provided, then checks for video file and thumbnail in the request. It uploads both files to Cloudinary cloud storage, creates a new video document in MongoDB with all the metadata, and returns the created video with populated owner information. The function uses multer middleware to handle file uploads and includes comprehensive error handling.

---

### 1.2 Get All Videos Function

```javascript
const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  const pipeline = [];

  // Match stage for filtering
  const matchConditions = {
    isPublished: true,
  };

  if (query) {
    matchConditions.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }

  if (userId) {
    matchConditions.owner = new mongoose.Types.ObjectId(userId);
  }

  pipeline.push({ $match: matchConditions });

  // Lookup owner information
  pipeline.push({
    $lookup: {
      from: "users",
      localField: "owner",
      foreignField: "_id",
      as: "owner",
      pipeline: [
        {
          $project: {
            username: 1,
            avatar: 1,
            fullName: 1,
          },
        },
      ],
    },
  });

  pipeline.push({
    $addFields: {
      owner: {
        $first: "$owner",
      },
    },
  });

  // Sort stage
  const sortStage = {};
  if (sortBy && sortType) {
    sortStage[sortBy] = sortType === "desc" ? -1 : 1;
  } else {
    sortStage.createdAt = -1;
  }
  pipeline.push({ $sort: sortStage });

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };

  const videos = await Video.aggregatePaginate(
    Video.aggregate(pipeline),
    options
  );

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});
```

**Explanation:** This function retrieves a paginated list of published videos with advanced filtering and sorting capabilities. It builds a MongoDB aggregation pipeline that can filter by search query, user ID, and other criteria. The function populates owner information, implements sorting by various fields, and uses mongoose-aggregate-paginate for efficient pagination. It returns structured data with pagination metadata.

---

### 1.3 Get Video By ID Function

```javascript
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "channel",
              as: "subscribers",
            },
          },
          {
            $addFields: {
              subscribersCount: {
                $size: "$subscribers",
              },
              isSubscribed: {
                $cond: {
                  if: {
                    $in: [req.user?._id, "$subscribers.subscriber"],
                  },
                  then: true,
                  else: false,
                },
              },
            },
          },
          {
            $project: {
              username: 1,
              avatar: 1,
              subscribersCount: 1,
              isSubscribed: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: "$likes",
        },
        owner: {
          $first: "$owner",
        },
        isLiked: {
          $cond: {
            if: { $in: [req.user?._id, "$likes.likedBy"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        videoFile: 1,
        title: 1,
        description: 1,
        views: 1,
        createdAt: 1,
        duration: 1,
        comments: 1,
        owner: 1,
        likesCount: 1,
        isLiked: 1,
      },
    },
  ]);

  if (!video?.length) {
    throw new ApiError(404, "Video does not exist");
  }

  // Increment views
  await Video.findByIdAndUpdate(videoId, {
    $inc: {
      views: 1,
    },
  });

  // Add to watch history
  await User.findByIdAndUpdate(req.user?._id, {
    $addToSet: {
      watchHistory: videoId,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, video[0], "Video details fetched successfully"));
});
```

**Explanation:** This function fetches a specific video by ID with comprehensive details including likes, owner information, subscriber count, and user interaction status. It uses MongoDB aggregation to efficiently join multiple collections and calculate derived fields like like counts and subscription status. The function also increments the view count atomically and adds the video to the user's watch history.

---

### 1.4 Update Video Function

```javascript
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  if (!(title && description)) {
    throw new ApiError(400, "Title and description are required");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video?.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(
      400,
      "You can't edit this video as you are not the owner"
    );
  }

  // Delete old thumbnail and update if new one provided
  const thumbnailToDelete = video.thumbnail;
  const thumbnailLocalPath = req.file?.path;

  let thumbnail;
  if (thumbnailLocalPath) {
    thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!thumbnail.url) {
      throw new ApiError(400, "Error while uploading thumbnail");
    }

    // Delete old thumbnail from cloudinary
    if (thumbnailToDelete) {
      await deleteOnCloudinary(thumbnailToDelete);
    }
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title,
        description,
        thumbnail: thumbnail?.url || video?.thumbnail,
      },
    },
    { new: true }
  ).populate("owner", "username avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});
```

**Explanation:** This function allows video owners to update video metadata like title, description, and thumbnail. It first validates the video ID and ownership, then handles thumbnail replacement if a new one is provided. The function manages cloud storage by deleting old thumbnails when replaced and ensures only authorized users can modify videos. It returns the updated video with populated owner information.

---

### 1.5 Delete Video Function

```javascript
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video?.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(
      400,
      "You can't delete this video as you are not the owner"
    );
  }

  // Delete video and thumbnail from cloudinary
  const videoDeleted = await deleteOnCloudinary(video.videoFile);
  const thumbnailDeleted = await deleteOnCloudinary(video.thumbnail);

  if (!videoDeleted) {
    throw new ApiError(400, "Error while deleting video from cloudinary");
  }

  // Delete associated data
  await Like.deleteMany({ video: videoId });
  await Comment.deleteMany({ video: videoId });
  await Playlist.updateMany(
    { videos: videoId },
    { $pull: { videos: videoId } }
  );

  // Delete the video
  await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
});
```

**Explanation:** This function permanently deletes a video and all associated data. It verifies ownership, removes video and thumbnail files from cloud storage, deletes related likes and comments, removes video from playlists, and finally deletes the video document. The function implements cascading deletion to maintain data integrity across the platform.

---

### 1.6 Toggle Publish Status Function

```javascript
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video?.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(
      400,
      "You can't edit this video as you are not the owner"
    );
  }

  const toggledVideoPublish = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: !video?.isPublished,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isPublished: toggledVideoPublish.isPublished },
        "Video publish status updated successfully"
      )
    );
});
```

**Explanation:** This function toggles the published status of a video between public and private. It validates ownership and video existence, then flips the isPublished boolean field. This allows content creators to control video visibility without deleting content, useful for scheduling or temporarily hiding videos.

---

## 2. Comment Controller

### 2.1 Get Video Comments Function

```javascript
const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const commentsAggregate = Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "comment",
        as: "likes",
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: "$likes",
        },
        owner: {
          $first: "$owner",
        },
        isLiked: {
          $cond: {
            if: { $in: [req.user?._id, "$likes.likedBy"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        content: 1,
        createdAt: 1,
        likesCount: 1,
        owner: 1,
        isLiked: 1,
      },
    },
  ]);

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };

  const comments = await Comment.aggregatePaginate(commentsAggregate, options);

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched successfully"));
});
```

**Explanation:** This function retrieves paginated comments for a specific video with user information and like counts. It uses MongoDB aggregation to join user data and calculate like statistics, sorts comments by creation date, and implements pagination. The function also includes whether the current user has liked each comment.

---

### 2.2 Add Comment Function

```javascript
const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "Content is required");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: req.user._id,
  });

  if (!comment) {
    throw new ApiError(500, "Failed to add comment please try again");
  }

  const createdComment = await Comment.findById(comment._id).populate(
    "owner",
    "username fullName avatar"
  );

  return res
    .status(201)
    .json(new ApiResponse(201, createdComment, "Comment added successfully"));
});
```

**Explanation:** This function creates a new comment on a video. It validates the content and video existence, creates a comment document with the authenticated user as owner, and returns the created comment with populated user information. The function ensures data integrity by verifying the video exists before allowing comments.

---

### 2.3 Update Comment Function

```javascript
const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "Content is required");
  }

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment id");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (comment?.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "Only comment owner can edit their comment");
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content,
      },
    },
    { new: true }
  ).populate("owner", "username fullName avatar");

  if (!updatedComment) {
    throw new ApiError(500, "Failed to edit comment please try again");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Comment edited successfully"));
});
```

**Explanation:** This function allows users to edit their own comments. It validates the new content, verifies comment ownership, updates the comment in the database, and returns the updated comment with owner information. The function implements authorization to ensure only comment owners can modify their content.

---

### 2.4 Delete Comment Function

```javascript
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment id");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (comment?.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "Only comment owner can delete their comment");
  }

  // Delete associated likes
  await Like.deleteMany({ comment: commentId });

  await Comment.findByIdAndDelete(commentId);

  return res
    .status(200)
    .json(new ApiResponse(200, { commentId }, "Comment deleted successfully"));
});
```

**Explanation:** This function permanently deletes a comment and its associated data. It verifies ownership, removes related likes, and deletes the comment document. The function maintains data integrity by cleaning up all references to the deleted comment across the platform.

---

## 3. Like Controller

### 3.1 Toggle Video Like Function

```javascript
const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const likedAlready = await Like.findOne({
    video: videoId,
    likedBy: req.user?._id,
  });

  if (likedAlready) {
    await Like.findByIdAndDelete(likedAlready?._id);

    return res
      .status(200)
      .json(
        new ApiResponse(200, { isLiked: false }, "Video unliked successfully")
      );
  }

  await Like.create({
    video: videoId,
    likedBy: req.user?._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { isLiked: true }, "Video liked successfully"));
});
```

**Explanation:** This function toggles like status on videos. It checks if the user has already liked the video, and either removes the existing like or creates a new one. The function returns the current like status and ensures users can only like/unlike videos once, preventing duplicate likes.

---

### 3.2 Toggle Comment Like Function

```javascript
const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment id");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const likedAlready = await Like.findOne({
    comment: commentId,
    likedBy: req.user?._id,
  });

  if (likedAlready) {
    await Like.findByIdAndDelete(likedAlready?._id);

    return res
      .status(200)
      .json(
        new ApiResponse(200, { isLiked: false }, "Comment unliked successfully")
      );
  }

  await Like.create({
    comment: commentId,
    likedBy: req.user?._id,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { isLiked: true }, "Comment liked successfully")
    );
});
```

**Explanation:** Similar to video likes, this function manages like/unlike functionality for comments. It prevents duplicate likes and provides immediate feedback on the like status. The function maintains referential integrity by verifying the comment exists before processing the like action.

---

### 3.3 Get Liked Videos Function

```javascript
const getLikedVideos = asyncHandler(async (req, res) => {
  const pipeline = [
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "likedVideo",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "ownerDetails",
              pipeline: [
                {
                  $project: {
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $unwind: "$ownerDetails",
          },
        ],
      },
    },
    {
      $unwind: "$likedVideo",
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        _id: 0,
        likedVideo: {
          _id: 1,
          videoFile: 1,
          thumbnail: 1,
          owner: 1,
          title: 1,
          description: 1,
          views: 1,
          duration: 1,
          createdAt: 1,
          isPublished: 1,
          ownerDetails: 1,
        },
      },
    },
  ];

  const likedVideos = await Like.aggregate(pipeline);

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    );
});
```

**Explanation:** This function retrieves all videos that the authenticated user has liked. It uses aggregation to join like data with video information and owner details, sorts by most recently liked, and filters out any videos that may have been deleted. The function provides a personalized list for users to revisit content they've enjoyed.

---

## 4. Subscription Controller

### 4.1 Toggle Subscription Function

```javascript
const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel id");
  }

  if (channelId?.toString() === req.user?._id.toString()) {
    throw new ApiError(400, "You cannot subscribe to your own channel");
  }

  const channel = await User.findById(channelId);

  if (!channel) {
    throw new ApiError(404, "Channel does not exist");
  }

  const subscriptionAlready = await Subscription.findOne({
    subscriber: req.user?._id,
    channel: channelId,
  });

  if (subscriptionAlready) {
    await Subscription.findByIdAndDelete(subscriptionAlready?._id);

    return res
      .status(200)
      .json(
        new ApiResponse(200, { subscribed: false }, "Unsubscribed successfully")
      );
  }

  await Subscription.create({
    subscriber: req.user?._id,
    channel: channelId,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { subscribed: true }, "Subscribed successfully")
    );
});
```

**Explanation:** This function handles channel subscription/unsubscription logic. It prevents self-subscription, checks if the user is already subscribed, and toggles the subscription status accordingly. The function maintains the subscriber-channel relationship in a dedicated collection and provides immediate feedback on subscription status.

---

### 4.2 Get Channel Subscribers Function

```javascript
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  let { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel id");
  }

  channelId = new mongoose.Types.ObjectId(channelId);

  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: channelId,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber",
        pipeline: [
          {
            $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "channel",
              as: "subscribedToSubscriber",
            },
          },
          {
            $addFields: {
              subscribedToSubscriber: {
                $cond: {
                  if: {
                    $in: [channelId, "$subscribedToSubscriber.subscriber"],
                  },
                  then: true,
                  else: false,
                },
              },
              subscribersCount: {
                $size: "$subscribedToSubscriber",
              },
            },
          },
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
              subscribedToSubscriber: 1,
              subscribersCount: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$subscriber",
    },
    {
      $project: {
        _id: 0,
        subscriber: 1,
        subscribedAt: "$createdAt",
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, subscribers, "Subscribers fetched successfully")
    );
});
```

**Explanation:** This function retrieves all subscribers for a specific channel with additional metadata like mutual subscription status. It uses complex aggregation to provide enriched subscriber information including whether the channel owner is subscribed back to each subscriber, creating a comprehensive view of the subscriber relationship.

---

### 4.3 Get Subscribed Channels Function

```javascript
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid subscriber id");
  }

  const subscriptions = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "subscribedChannel",
        pipeline: [
          {
            $lookup: {
              from: "videos",
              localField: "_id",
              foreignField: "owner",
              as: "videos",
            },
          },
          {
            $addFields: {
              latestVideo: {
                $last: "$videos",
              },
            },
          },
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
              latestVideo: {
                _id: 1,
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                duration: 1,
                createdAt: 1,
                views: 1,
              },
            },
          },
        ],
      },
    },
    {
      $unwind: "$subscribedChannel",
    },
    {
      $project: {
        _id: 0,
        subscribedChannel: 1,
        subscribedAt: "$createdAt",
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscriptions,
        "Subscribed channels fetched successfully"
      )
    );
});
```

**Explanation:** This function gets all channels that a user has subscribed to, including their latest video information. It provides a feed-like experience by showing recent content from subscribed channels, helping users stay updated with their favorite creators. The aggregation includes video metadata for immediate content discovery.

---

## 5. Playlist Controller

### 5.1 Create Playlist Function

```javascript
const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        throw new ApiError(400, "Name is required");
    }

    const playlist = await Playlist.create({
        name,
        description: description || "",
        owner: req.user._id,
        videos: []
    });

    if (!playlist) {
```
