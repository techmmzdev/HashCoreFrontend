// frontend/src/api/axios.js
import axios from "axios";

// 🛑 Debe apuntar a la base URL del backend (ej: http://localhost:7500/api)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: Inyecta el token en cada petición protegida.
api.interceptors.request.use(
  (config) => {
    // Obtener el token del almacenamiento local
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Opcional: Interceptor de respuesta para manejar 401/403 (desconexión forzada)
// Lo haremos más tarde en el AuthContext.

export default api;
