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

// Interceptor de respuesta para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el token es inválido o expiró, limpiar el localStorage
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem("token");
      // Evitar bucles infinitos de redirección
      if (
        !window.location.pathname.includes("/") ||
        window.location.pathname !== "/"
      ) {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
