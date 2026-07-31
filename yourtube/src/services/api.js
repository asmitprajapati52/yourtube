import axiosInstance from "@/lib/axiosinstance";


const API = axiosInstance.create({ 
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "https://youtube-07v0.onrender.com"
});

// 1. Video download request record karne ke liye (Limit check ke sath)
export const recordDownload = (userId, videoId) => 
  API.post("/downloads/download-video", { userId, videoId });

// 2. User ke saare downloaded videos fetch karne ke liye
export const fetchUserDownloads = (userId) => 
  API.get(`/downloads/user-downloads/${userId}`);