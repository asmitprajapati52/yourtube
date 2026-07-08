"use strict";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ES Modules mein directory path set karne ka sahi absolute tarika
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ekdum accurate automatic fallback path 'D:\youtube\server\uploads' ke liye
const uploadDir = path.join(__dirname, "..", "uploads");

// 🚀 automatic check: Agar folder purani directory ke hisab se missing hai, toh khud bana dega!
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("🚀 Uploads directory created at:", uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Absolute path dene se kabhi error nahi aayega
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    );
  },
});

const filefilter = (req, file, cb) => {
  // Sabhi major video types ko allow karne ke liye condition thodi broad kar di taaki crash na ho
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