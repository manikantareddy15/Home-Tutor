import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("hometutor_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Don't set Content-Type for FormData, let axios/browser set it
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  
  return config;
});

export default api;
