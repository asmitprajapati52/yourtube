import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dns from "dns";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";

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

// ✅ Force Node to use Google DNS
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();
const server = http.createServer(app);

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;
const DBURL = process.env.DB_URL;

// Middleware
app.use(cors());
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(bodyParser.json());

// Uploads Folder
const uploadsPath = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
}

app.use("/uploads", express.static(uploadsPath));

// Streaming Route
app.get("/uploads/:filename", (req, res) => {
  const filePath = path.join(
    uploadsPath,
    decodeURIComponent(req.params.filename)
  );

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

    const chunkSize = end - start + 1;

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "video/mp4",
    });

    fs.createReadStream(filePath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    });

    fs.createReadStream(filePath).pipe(res);
  }
});

// Routes
app.use("/user", userroutes);
app.use("/video", videoroutes);
app.use("/like", likeroutes);
app.use("/watch", watchlaterroutes);
app.use("/history", historyrroutes);
app.use("/comment", commentroutes);
app.use("/payment", paymentroutes);
app.use("/downloads", downloadroutes);

app.get("/", (req, res) => {
  res.send("YouTube backend is running!");
});

// Socket.io
io.on("connection", (socket) => {
  console.log(`⚡ User connected: ${socket.id}`);

  socket.on("join-room", ({ roomId, username }) => {
    socket.join(roomId);
    console.log(`User ${username} (${socket.id}) joined room: ${roomId}`);

    socket.to(roomId).emit("user-connected", {
      userId: socket.id,
      username,
    });
  });

  socket.on("video-action", ({ roomId, action, currentTime }) => {
    socket.to(roomId).emit("sync-video-action", {
      action,
      currentTime,
    });
  });

  socket.on("send-message", ({ roomId, message, username }) => {
    io.to(roomId).emit("receive-message", {
      message,
      username,
      timestamp: new Date(),
    });
  });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// ✅ 1. Pehle Server ko PORT par listen karao (Render ke liye zaroori hai)
server.listen(PORT, () => {
  console.log(`🚀 Server with Socket.io running on port ${PORT}`);
});

// ✅ 2. Phir Background mein Database connect karo
mongoose
  .connect(DBURL)
  .then(() => {
    console.log("🎯 MongoDB Atlas Connected");
  })
  .catch((error) => {
    console.log("❌ DB Connection Failed:", error.message);
  });