import express from "express";
import { 
  uploadvideo, 
  getallvideo, 
  getvideosbychannel, 
  streamVideoFile, 
  generateSignature, 
  getchanneldetails 
} from "../controllers/video.js";
import upload from "../filehelper/filehelper.js";

const router = express.Router();

router.post("/upload", upload.single("file"), uploadvideo);

// 🚀 Support both /getvideo and /getall to prevent 404 errors on home page
router.get("/getvideo", getallvideo);
router.get("/getall", getallvideo);

// 🚀 Channel routes (Handles both patterns to avoid 404)
router.get("/getvideobychannel/:id", getvideosbychannel);
router.get("/channel/:id", getvideosbychannel);

// 🚀 Channel Details route (Fixes the 404 error on channel page)
router.get("/details/:id", getchanneldetails);

router.get("/stream/:filename", streamVideoFile);
router.get("/get-signature", generateSignature);

export default router;