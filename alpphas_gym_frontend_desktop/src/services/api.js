import axios from "axios";

// Base da URL do seu backend — ajuste conforme necessário
const api = axios.create({
  baseURL: "https://alpphas-gym-backend.onrender.com",
});

// Interceptor opcional: inclui o token JWT em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
