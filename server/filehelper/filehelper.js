"use strict";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

// 🚀 Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🚀 Use Memory Storage to avoid signature/disk path issues on Render
const storage = multer.memoryStorage();

const filefilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new Error("Only video files are allowed!"), false);
  }
};

const upload = multer({ 
  storage: storage, 
  fileFilter: filefilter,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

export default upload;