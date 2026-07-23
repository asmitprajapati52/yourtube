import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import http from "http"; // 🚀 1. http module import karein
import { Server } from "socket.io"; // 🚀 2. socket.io import karein

// Route Imports
import userroutes from "./routes/auth.js";
import videoroutes from "./routes/video.js";
import likeroutes from "./routes/like.js";
import watchlaterroutes from "./routes/watchlater.js";
import historyrroutes from "./routes/history.js";
import commentroutes from "./routes/comment.js";
import paymentroutes from "./routes/payment.js";
import downloadroutes from "./routes/download.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
const server = http.createServer(app); // 🚀 3. Express app ko http server mein wrap karein

// 🚀 4. Socket.io setup karein (CORS enabled)
const io = new Server(server, {
  cors: {
    origin: "*", // Aap apne frontend ka URL bhi de sakte hain jaise "http://localhost:3000"
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;
const DBURL = process.env.DB_URL;

// Middleware
app.use(cors());
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(bodyParser.json());

// Absolute Path Setup for Uploads
const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath);
}
app.use("/uploads", express.static(uploadsPath));

// Streaming Route (for 206 Partial Content)
app.get("/uploads/:filename", (req, res) => {
  const filePath = path.join(uploadsPath, decodeURIComponent(req.params.filename));
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    });
    fs.createReadStream(filePath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, { 'Content-Length': fileSize, 'Content-Type': 'video/mp4' });
    fs.createReadStream(filePath).pipe(res);
  }
});

// App Routes
app.use("/user", userroutes);
app.use("/video", videoroutes);
app.use("/like", likeroutes);
app.use("/watch", watchlaterroutes);
app.use("/history", historyrroutes);
app.use("/comment", commentroutes);
app.use("/payment", paymentroutes);
app.use("/downloads", downloadroutes);

app.get("/", (req, res) => { res.send("YouTube backend is running!"); });

// 🚀 5. Socket.io Connection Logic for Watch Party
io.on("connection", (socket) => {
  console.log(`⚡ User connected: ${socket.id}`);

  // Room Join karne ka event
  socket.on("join-room", ({ roomId, username }) => {
    socket.join(roomId);
    console.log(`User ${username} (${socket.id}) joined room: ${roomId}`);
    socket.to(roomId).emit("user-connected", { userId: socket.id, username });
  });

  // Video Sync Action (Play, Pause, Seek)
  socket.on("video-action", ({ roomId, action, currentTime }) => {
    socket.to(roomId).emit("sync-video-action", { action, currentTime });
  });

  // Real-time Chat Message
  socket.on("send-message", ({ roomId, message, username }) => {
    io.to(roomId).emit("receive-message", { message, username, timestamp: new Date() });
  });

  // Disconnect event
  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// MongoDB Connection & Server Listen using `server.listen` instead of `app.listen`
mongoose.connect(DBURL)
  .then(() => {
    server.listen(PORT, () => console.log(`🚀 Server with Socket.io running on port ${PORT}`));
  })
  .catch((error) => console.log("DB Connection Failed:", error.message));