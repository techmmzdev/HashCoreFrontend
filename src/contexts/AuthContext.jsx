/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";
import { decodeToken } from "@/utils/authUtils.js";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // user: { id, email, role, clientId }
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Inicialmente TRUE

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      let storedUser = null;

      if (token) {
        try {
          const userData = decodeToken(token);

          if (userData) {
            storedUser = userData;
          }
        } catch (err) {
          // Esto solo debería ocurrir si hay un fallo mayor en jwt-decode
          console.error("Error al decodificar el token:", err);
          localStorage.removeItem("token");
        }
      }

      // Establece el usuario (puede ser null)
      setUser(storedUser);

      setLoading(false);
    };

    initializeAuth();
  }, []); // Se ejecuta solo al montar el componente

  const login = async (email, password) => {
    try {
      const res = await api.post("/users/login", { email, password });
      const token = res.data?.token;

      if (!token) throw new Error("No se recibió el token");

      localStorage.setItem("token", token);

      const userData = decodeToken(token); // Decodifica y verifica la validez/expiración
      if (!userData)
        throw new Error(
          "Token decodificado es inválido o expiró inmediatamente."
        );

      setUser(userData);

      return userData;
    } catch (error) {
      console.error("Error en login:", error);
      // Normalizar a string para que los consumidores (p.ej. LoginPage) reciban siempre un mensaje
      const message =
        error?.response?.data?.message ||
        error?.message ||
        String(error) ||
        "Error al iniciar sesión";
      throw message;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    // El SocketContext conectado a este AuthContext detectará el cambio y desconectará el socket.
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "ADMIN",
    isClient: user?.role === "CLIENTE",
    login,
    logout,
  };

  // Muestra la pantalla de carga durante la inicialización
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
        Cargando autenticación...
      </div>
    );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
