import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // http://127.0.0.1:8000/api
  headers: { "Content-Type": "application/json" },
});

// 1. Attach the token to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. One place to handle an expired / missing token
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default client;
