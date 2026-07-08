import axios from "axios";

const axiosInstance = axios.create({
  // FIXED: URL se '/api' hata diya taaki yeh direct backend ke routes se match kare
  baseURL: "http://127.0.0.1:5000",
});

export default axiosInstance;