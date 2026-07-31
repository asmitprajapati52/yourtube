import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "https://youtube-07v0.onrender.com",
  withCredentials: true, // Cookies aur headers ko properly pass karne ke liye zaroori hai
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;