import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/routes/ProtectedRoute";

// Layouts
import AdminLayout from "@/layouts/AdminLayout.jsx";
import ClientLayout from "@/layouts/ClientLayout.jsx";

// Páginas comunes
import LoginPage from "@/pages/auth/LoginPage.jsx";
import UnauthorizedPage from "@/pages/auth/UnauthorizedPage.jsx";
import NotFoundPage from "@/pages/NotFoundPage.jsx";
import Loading from "@/components/common/Loading.jsx";

import DashboardPage from "@/pages/admin/DashboardPage.jsx";
import ClientsPage from "@/pages/admin/ClientsPage.jsx";
import AdminsPage from "@/pages/admin/AdminsPage.jsx";
import ClientPublicationsPage from "@/pages/admin/ClientPublicationsPage.jsx";
import ReportsPage from "@/pages/admin/ReportsPage.jsx";

// Páginas CLIENTE
import DashboardClientPage from "@/pages/client/DashboardClientPage.jsx";
import ClientPublicationsList from "@/pages/client/ClientPublicationsList.jsx";
// import ClientCalendarPage from "@/pages/client/ClientCalendarPage.jsx";

const AppRoutes = () => {
  const { user, loading, isAdmin, isClient } = useAuth();

  if (loading) {
    return <Loading fullScreen message="Verificando sesión..." />;
  }

  return (
    <Routes>
      {/* 1️⃣ Login (Ruta principal /) */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate
              to={
                isAdmin
                  ? "/admin/dashboard"
                  : isClient
                  ? "/client/dashboard"
                  : "/unauthorized"
              }
              replace
            />
          ) : (
            <LoginPage />
          )
        }
      />

      {/* 2️⃣ Acceso no autorizado */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* 3️⃣ ADMIN - Rutas Protegidas */}
      <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
        <Route path="admin" element={<AdminLayout />}>
          {/* Índice /admin redirige al dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="admins" element={<AdminsPage />} />
          <Route path="reports" element={<ReportsPage />} />

          {/* Ruta para ver las publicaciones de un cliente específico */}
          <Route
            path="publications/client/:clientId"
            element={<ClientPublicationsPage />}
          />
        </Route>
      </Route>

      {/* 4️⃣ CLIENTE - Rutas Protegidas */}
      <Route element={<ProtectedRoute requiredRole="CLIENTE" />}>
        <Route path="client" element={<ClientLayout />}>
          {/* Índice /client redirige al dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard" element={<DashboardClientPage />} />
          <Route path="publications" element={<ClientPublicationsList />} />
          {/* <Route path="calendar" element={<ClientCalendarPage />} /> */}
        </Route>
      </Route>

      {/* 5️⃣ 404 - Debe ir al final */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    // 🛑 CORRECCIÓN: Se elimina el </Router>
  );
};

export default AppRoutes;
