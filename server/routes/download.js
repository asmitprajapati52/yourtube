import express from "express";
import { downloadVideo, getUserDownloads } from "../controllers/download.js";

const router = express.Router();

router.post("/download-video", downloadVideo);
router.get("/user-downloads/:userId", getUserDownloads);

export default router;