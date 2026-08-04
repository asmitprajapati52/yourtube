import express from "express";
import { uploadvideo, getallvideo, getvideosbychannel, streamVideoFile, generateSignature } from "../controllers/video.js";
import upload from "../filehelper/filehelper.js";

const router = express.Router();

router.post("/upload", upload.single("file"), uploadvideo);
router.get("/getvideo", getallvideo);

// 🚀 Channel routes (Handles both patterns to avoid 404)
router.get("/getvideobychannel/:id", getvideosbychannel);
router.get("/channel/:id", getvideosbychannel);

router.get("/stream/:filename", streamVideoFile);
router.get("/get-signature", generateSignature);

export default router;