import axios from 'axios'

const api = axios.create({
    baseURL : "http://127.0.0.1:8000/api",
    headers: {
        "Content-Type": "application/json",
    }
});

// Middleware để thêm Authorization header (nếu có token)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("admin_token");  // Hoặc lấy từ nơi khác (ví dụ: context, sessionStorage)
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;  // Thêm Bearer token vào header
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;