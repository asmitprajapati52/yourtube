import axios from "axios";

// Express backend ka base URL (port 5000)
const API = axios.create({ 
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000" 
});

// 1. Video download request record karne ke liye (Limit check ke sath)
export const recordDownload = (userId, videoId) => 
  API.post("/downloads/download-video", { userId, videoId });

// 2. User ke saare downloaded videos fetch karne ke liye
export const fetchUserDownloads = (userId) => 
  API.get(`/downloads/user-downloads/${userId}`);