import { Router } from "express";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  uploadVideo, // ✅ now using uploadVideo
  togglePublishStatus,
  updateVideo,
} from "../controllers/video.controllers.js";

import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.use(verifyJWT); // Protect all routes with JWT

// GET all videos
router.route("/").get(getAllVideos);

// Upload video at /api/v1/videos/upload
router.route("/upload").post(
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  uploadVideo // ✅ calling correct controller fn
);

// Video operations with ID
router
  .route("/:videoId")
  .get(getVideoById)
  .delete(deleteVideo)
  .patch(upload.single("thumbnail"), updateVideo);

// Toggle publish status
router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router;
