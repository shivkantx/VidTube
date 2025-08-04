import { Router } from "express";
import { registerUser } from "../controllers/usercontrollers.js"; // ✅ correct
import { upload } from "../middlewares/multer.middleware.js"; // ✅ assumes file exists and exports correctly

const router = Router();

// ✅ Route: POST /api/v1/register
router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

export default router;
