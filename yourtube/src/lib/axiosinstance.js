import axios from "axios";

// Production-ready Axios instance with dynamic backend base URL
const axiosInstance = axios.create({
  baseURL:"https://youtube-07v0.onrender.com",
});

export default axiosInstance;