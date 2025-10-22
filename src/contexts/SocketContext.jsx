/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

const SOCKET_URL =
  import.meta.env.VITE_API_SOCKET_URL || "http://localhost:7500";

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { isAuthenticated, isAdmin, user } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem("token");

    // 1️⃣ Manejo de la desconexión si el usuario cierra sesión
    if (!isAuthenticated) {
      if (socket) {
        console.log(
          "[Socket] Usuario deslogueado. Cerrando conexión existente..."
        );
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // 2️⃣ Evitar reconexión innecesaria
    if (socket && socket.connected) {
      return;
    }

    // 3️⃣ Inicializar conexión
    if (!SOCKET_URL) {
      console.error("[Socket] ❌ No se definió VITE_API_SOCKET_URL en el .env");
      return;
    }

    console.log("[Socket] 🚀 Iniciando conexión con:", SOCKET_URL);

    try {
      const newSocket = io(SOCKET_URL, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        timeout: 20000,
        auth: {
          token,
          role: user?.role,
        },
      });

      // 4️⃣ Eventos del socket
      newSocket.on("connect", () => {
        console.log(
          `[Socket] ✅ Conectado al servidor con ID: ${newSocket.id}`
        );

        if (isAdmin) {
          newSocket.emit("join_admin_notifications", user.id);
        } else if (isAuthenticated) {
          newSocket.emit("join_client_room", user.id);
        }
      });

      newSocket.on("disconnect", (reason) => {
        console.warn("[Socket] ⚠️ Desconectado. Razón:", reason);
      });

      newSocket.on("connect_error", (error) => {
        console.error("[Socket] ❌ Error de conexión:", error);
      });

      newSocket.on("new_publication_pending", (data) => {
        console.log("[Socket/Admin] 📢 Nueva publicación pendiente:", data);
      });

      setSocket(newSocket);

      // 5️⃣ Cleanup al desmontar
      return () => {
        console.log(
          "[Socket] 🔌 Desconectando socket al desmontar o cambio de auth..."
        );
        newSocket.off();
        newSocket.disconnect();
      };
    } catch (error) {
      console.error("[Socket] ❌ Error al crear conexión WebSocket:", error);
    }
  }, [isAuthenticated, isAdmin, user?.id]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
