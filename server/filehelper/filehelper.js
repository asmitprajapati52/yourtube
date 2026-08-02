"use strict";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// 🚀 Cloudinary Configuration
// Ensure these environment variables are set in your Render dashboard / .env file
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🚀 Cloudinary Storage Engine Setup for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "yourtube_videos", // Cloudinary par is naam ka folder ban jayega
    resource_type: "auto",     // Automatically detects video/image files
    allowed_formats: ["mp4", "mov", "avi", "mkv", "webm", "m4v"],
  },
});

const filefilter = (req, file, cb) => {
  // Sabhi major video types ko allow karne ke liye condition
  if (file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new Error("Only video files are allowed!"), false);
  }
};

const upload = multer({ 
  storage: storage, 
  fileFilter: filefilter,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB video limit check
});

export default upload;