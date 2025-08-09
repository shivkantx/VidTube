import multer from "multer";
import fs from "fs";

// ensure folder exists
const folderPath = "./public/temp";
if (!fs.existsSync(folderPath)) {
  fs.mkdirSync(folderPath, { recursive: true });
}

// allowed file types
const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

// file filter function
const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed."
      ),
      false
    );
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, folderPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});
