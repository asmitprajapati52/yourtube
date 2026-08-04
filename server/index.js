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

// Allowed frontend origins
const allowedOrigins = [
  "https://yourtube-gamma.vercel.app",
  "http://localhost:3000"
];

// Express CORS Setup with credentials support (PATCH added here ✅)
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Socket.io Setup with CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;
const DBURL = process.env.DB_URL;

// Middleware
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(bodyParser.json());

// Uploads Folder
const uploadsPath = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
}

app.use("/uploads", express.static(uploadsPath));

// Streaming Route with 416 Range Error Fix
app.get("/uploads/:filename", (req, res) => {
  try {
    const filePath = path.join(
      uploadsPath,
      decodeURIComponent(req.params.filename)
    );

    let targetPath = filePath;
    if (!fs.existsSync(targetPath)) {
      try {
        const files = fs.readdirSync(uploadsPath);
        const mp4Files = files.filter(file => file.toLowerCase().endsWith(".mp4"));
        if (mp4Files.length > 0) {
          targetPath = path.join(uploadsPath, mp4Files[0]);
        } else {
          return res.status(404).send("File not found");
        }
      } catch (err) {
        return res.status(404).send("File not found");
      }
    }

    const stat = fs.statSync(targetPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      // Handle invalid range requests to prevent 416 crash
      if (start >= fileSize || end >= fileSize) {
        res.writeHead(416, {
          "Content-Range": `bytes */${fileSize}`
        });
        return res.end();
      }

      const chunkSize = end - start + 1;

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": "video/mp4",
      });

      fs.createReadStream(targetPath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
      });

      fs.createReadStream(targetPath).pipe(res);
    }
  } catch (err) {
    res.status(500).send("Error streaming video");
  }
});

// Routes
app.use("/user", userroutes);
app.use("/video", videoroutes);
app.use("/like", likeroutes);
app.use("/watchlater", watchlaterroutes);
app.use("/history", historyrroutes);
app.use("/comment", commentroutes);
app.use("/payment", paymentroutes);
app.use("/downloads", downloadroutes);

app.get("/", (req, res) => {
  res.send("YouTube backend is running!");
});

// Socket.io Events
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

// ✅ 1. Pehle Server ko PORT par listen karao
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