import express from "express";
import {
  getallwatchlater,
  handlewatchlater,
} from "../controllers/watchlater.js";

const routes = express.Router();

// GET /api/watchlater/user/12345
routes.get("/user/:userId", getallwatchlater);

// POST /api/watchlater/video/67890
routes.post("/video/:videoId", handlewatchlater);

export default routes;