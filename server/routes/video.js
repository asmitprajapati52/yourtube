import express from "express";
import { uploadvideo, getallvideo, getvideosbychannel, streamVideoFile, generateSignature } from "../controllers/video.js";
import upload from "../filehelper/filehelper.js";

const router = express.Router();

router.post("/upload", upload.single("file"), uploadvideo);
router.get("/getvideo", getallvideo);
router.get("/getvideobychannel/:id", getvideosbychannel);
router.get("/stream/:filename", streamVideoFile);

// 🚀 Naya Signature Route for Frontend Direct Upload
router.get("/get-signature", generateSignature);

export default router;