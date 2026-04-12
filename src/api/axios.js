import axios from "axios";

const api = axios.create({
  baseURL: window.location.hostname === 'localhost' 
    ? 'http://localhost:8000/api/v1'
    : 'https://vedam-backend.vercel.app/api/v1',
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
