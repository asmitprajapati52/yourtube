import axios from "axios";

const axiosInstance = axios.create({
  // FIXED: URL se '/api' hata diya taaki yeh direct backend ke routes se match kare
  baseURL: "http://10.137.132.66:5000", 
});

export default axiosInstance;