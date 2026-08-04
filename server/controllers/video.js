import video from "../modals/video.js";

// ==========================================
// 1. UPLOAD VIDEO CONTROLLER (Cloudinary Enabled)
// ==========================================
export const uploadvideo = async (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ message: "Please upload a valid video file only" });
  }

  try {
    const videoUrl = req.file.path || req.file.secure_url; 
    const fileName = req.file.filename || req.file.public_id || req.file.originalname || "video";

    const newVideo = new video({
      videotitle: req.body.videotitle || "Untitled Video",
      filename: fileName,
      filepath: videoUrl,
      filetype: req.file.mimetype || "video/mp4",
      filesize: req.file.size ? `${(req.file.size / (1024 * 1024)).toFixed(2)} MB` : "Unknown",
      videochanel: req.body.videochanel || "Anonymous Channel",
      uploader: req.body.uploader || "",
    });
    
    await newVideo.save();
    return res.status(201).json({ message: "File uploaded successfully", video: newVideo });
  } catch (error) {
    console.error("❌ Cloudinary Upload error message: " + (error.message || JSON.stringify(error)));
    return res.status(500).json({ error: error.message || "Failed to upload video to cloud storage." });
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
    console.error("❌ DB Fetch failed message: " + (error.message || JSON.stringify(error)));
    return res.status(500).json({ message: "Error fetching videos" });
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
    console.error("❌ Channel Videos Fetch failed message: " + (error.message || JSON.stringify(error)));
    return res.status(500).json({ message: "Error fetching channel videos" });
  }
};

// ==========================================
// 4. STREAM CONTROLLER
// ==========================================
export const streamVideoFile = async (req, res) => {
  return res.status(410).json({ message: "Local streaming is deprecated. Videos are now served via Cloudinary URLs." });
};