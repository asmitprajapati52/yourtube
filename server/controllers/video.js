import video from "../modals/video.js";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

// ==========================================
// 1. UPLOAD VIDEO CONTROLLER (Memory Storage Stream Buffer)
// ==========================================
export const uploadvideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "Please upload a valid video file only" });
    }

    const streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "yourtube_videos", resource_type: "auto" },
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    const result = await streamUpload(req);

    const newVideo = new video({
      videotitle: req.body.videotitle || "Untitled Video",
      filename: result.public_id || req.file.originalname,
      filepath: result.secure_url,
      filetype: req.file.mimetype || "video/mp4",
      filesize: req.file.size ? `${(req.file.size / (1024 * 1024)).toFixed(2)} MB` : "Unknown",
      videochanel: req.body.videochanel || "Anonymous Channel",
      uploader: req.body.uploader || "",
    });
    
    await newVideo.save();
    return res.status(201).json({ success: true, message: "File uploaded successfully", video: newVideo });
  } catch (error) {
    console.error("❌ Cloudinary Buffer Upload Error:", error.message || error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || "Failed to upload video to cloud storage." 
    });
  }
};

// ==========================================
// 2. GET ALL VIDEO CONTROLLER
// ==========================================
export const getallvideo = async (req, res) => {
  try {
    const files = await video.find().sort({ createdAt: -1 });
    return res.status(200).json(files);
  } catch (error) {
    console.error("❌ DB Fetch failed:", error.message);
    return res.status(500).json({ success: false, message: "Error fetching videos" });
  }
};

// ==========================================
// 3. GET VIDEOS BY CHANNEL CONTROLLER
// ==========================================
export const getvideosbychannel = async (req, res) => {
  try {
    const { id } = req.params;
    const channelVideos = await video.find({ uploader: id }).sort({ createdAt: -1 });
    return res.status(200).json(channelVideos);
  } catch (error) {
    console.error("❌ Channel Videos Fetch failed:", error.message);
    return res.status(500).json({ success: false, message: "Error fetching channel videos" });
  }
};

// ==========================================
// 4. SIGNATURE GENERATOR
// ==========================================
export const generateSignature = async (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = "yourtube_videos";
    
    const signature = cloudinary.utils.api_sign_request(
      { folder, timestamp },
      process.env.CLOUDINARY_API_SECRET
    );

    return res.status(200).json({
      success: true,
      signature,
      timestamp,
      folder,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME
    });
  } catch (error) {
    console.error("❌ Signature Generation Error:", error);
    return res.status(500).json({ success: false, error: "Failed to generate signature" });
  }
};

// ==========================================
// 5. STREAM CONTROLLER
// ==========================================
export const streamVideoFile = async (req, res) => {
  return res.status(410).json({ success: false, message: "Local streaming is deprecated. Videos are now served via Cloudinary URLs." });
};

// ==========================================
// 6. GET CHANNEL DETAILS CONTROLLER (NEW)
// ==========================================
export const getchanneldetails = async (req, res) => {
  try {
    const { id } = req.params;
    const channelVideos = await video.find({ uploader: id });
    
    return res.status(200).json({
      success: true,
      channelId: id,
      channelname: channelVideos.length > 0 ? channelVideos[0].videochanel : "User Channel",
      totalVideos: channelVideos.length,
    });
  } catch (error) {
    console.error("❌ Channel Details Fetch Error:", error.message);
    return res.status(500).json({ success: false, message: "Error fetching channel details" });
  }
};