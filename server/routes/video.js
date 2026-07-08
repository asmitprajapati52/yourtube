import express from "express";
import { getallvideo, uploadvideo, getvideosbychannel, streamVideoFile } from "../controllers/video.js";
import upload from "../filehelper/filehelper.js";

const routes = express.Router();

// 1. Video Upload Endpoint
routes.post("/upload", upload.single("file"), uploadvideo);

// 2. Home Page Videos Endpoint
routes.get("/getall", getallvideo);

// 3. Specific Channel Videos Endpoint
routes.get("/channel/:id", getvideosbychannel);

// 🚀 FIXED PATH MATCHING: Frontend se jab '/video/uploads/vdo.mp4' ya '/video/vdo.mp4' hit hoga,
// toh ye seedhe hamare high-performance custom stream controller ko call karega!
routes.get("/uploads/:filename", streamVideoFile);
routes.get("/vdo.mp4", streamVideoFile);

// 4. Channel Metadata Fallback Endpoint
routes.get("/details/:id", (req, res) => {
  const { id } = req.params;
  return res.status(200).json({
    _id: id,
    channelname: "CodingNings",
    description: "Welcome to my official customized developer channel!",
    subscribers: "125K",
    ownerId: id 
  });
});

export default routes;