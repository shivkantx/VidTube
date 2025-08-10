import { Router } from "express";
import { registerUser, logoutUser } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

//  Logout route
router.route("/logout").post(verifyJWT, logoutUser);

export default router;
