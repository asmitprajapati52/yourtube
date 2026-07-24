import express from "express";
import { 
  deletecomment, 
  getallcomment, 
  postcomment, 
  editcomment, 
  likeComment, 
  dislikeComment, 
  reportComment 
} from "../controllers/comment.js";

const routes = express.Router();

routes.get("/:videoid", getallcomment);
routes.post("/postcomment", postcomment);
routes.delete("/deletecomment/:id", deletecomment);
routes.post("/editcomment/:id", editcomment);

// 🚀 New Interaction Routes
routes.patch("/like/:id", likeComment);
routes.patch("/dislike/:id", dislikeComment);
routes.patch("/report/:id", reportComment);

export default routes;