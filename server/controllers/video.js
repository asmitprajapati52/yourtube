import video from "../modals/video.js";

// ==========================================
// 1. UPLOAD VIDEO CONTROLLER (Cloudinary Enabled - Safe JSON Response)
// ==========================================
export const uploadvideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "Please upload a valid video file only" });
    }

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
    return res.status(201).json({ success: true, message: "File uploaded successfully", video: newVideo });
  } catch (error) {
    console.error("❌ Cloudinary/DB Upload Error:", error.message || error);
    // 🚀 HAMESHA JSON RETURN KAREGA, KABHI HTML NAHI FEKEGA!
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
// 4. STREAM CONTROLLER
// ==========================================
export const streamVideoFile = async (req, res) => {
  return res.status(410).json({ success: false, message: "Local streaming is deprecated. Videos are now served via Cloudinary URLs." });
};