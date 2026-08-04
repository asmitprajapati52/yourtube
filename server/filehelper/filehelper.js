"use strict";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// 🚀 Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🚀 Cloudinary Storage Engine Setup with fixed parameters
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "yourtube_videos",
      resource_type: "auto",
      public_id: `video_${Date.now()}_${file.originalname.split(".")[0]}`
    };
  },
});

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