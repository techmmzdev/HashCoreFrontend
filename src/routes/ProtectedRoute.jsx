import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute = ({ requiredRole }) => {
  // Obtenemos el estado de autenticación, el usuario y si está cargando
  const { isAuthenticated, user, loading } = useAuth();

  // 1. Mostrar estado de carga mientras se verifica el token inicial
  if (loading) {
    // Retorna el indicador de carga que ya definiste en AuthContext o un simple null
    return null; // El indicador de AuthContext ya se encarga de esto.
  }

  // 2. Si no está autenticado, redirigir a la página de login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // 3. Si el rol es requerido, verificar el rol
  if (requiredRole && user?.role !== requiredRole) {
    // Si no tiene el rol, redirigir basado en el rol que SÍ tiene (si tiene alguno)
    if (user?.role === "ADMIN") {
      // Si un ADMIN intenta acceder a una ruta de CLIENTE, lo mandamos a su panel
      return <Navigate to="/admin" replace />;
    }
    if (user?.role === "CLIENTE") {
      // Si un CLIENTE intenta acceder a una ruta de ADMIN, lo mandamos a su panel
      return <Navigate to="/client" replace />;
    }

    // Caso de rol desconocido o acceso totalmente prohibido
    return <Navigate to="/unauthorized" replace />;
  }

  // Si pasa todas las verificaciones, renderiza el contenido
  // Outlet se usa cuando el ProtectedRoute envuelve otros componentes (Layouts)
  return <Outlet />;
};

export default ProtectedRoute;
