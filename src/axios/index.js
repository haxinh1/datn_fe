import axios from "axios";

const instance = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  withCredentials: true,
});

// Middleware để thêm Authorization header (nếu có token)
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_token"); // Hoặc lấy từ nơi khác (ví dụ: context, sessionStorage)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Thêm Bearer token vào header
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
