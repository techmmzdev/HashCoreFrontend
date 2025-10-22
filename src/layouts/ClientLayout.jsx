import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  MessageCircle,
  Menu,
  X,
  LogOut,
  User,
  Loader2,
  Bell, // 🔔 Importamos el icono de campana para notificaciones
} from "lucide-react";

// 🛑 CORRECCIÓN: Ajustamos la ruta relativa al contexto
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";

const ClientLayout = () => {
  const { user, logout, loading } = useAuth();
  const { socket } = useSocket(); // 🔑 NUEVO: Obtenemos la instancia del socket
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // 🔔 Estado para el contador de notificaciones (ej: nuevos comentarios o aprobación)
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();

  // Gestión de la barra lateral (sin cambios)
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [sidebarOpen]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // 🔑 Integración de Socket (NUEVO)
  useEffect(() => {
    if (!socket) return;

    // Escuchador de notificaciones para el cliente (ej: publicación aprobada o nuevo comentario)
    const handleNewClientNotification = (data) => {
      console.log("[ClientLayout] Notificación recibida:", data);
      // Aquí se incrementa el contador de notificaciones no leídas
      setUnreadNotifications((prev) => prev + 1);
    };

    // Asume un evento de socket para el cliente (ej: "client_new_notification")
    socket.on("client_new_notification", handleNewClientNotification);

    // Limpieza al desmontar
    return () => {
      socket.off("client_new_notification", handleNewClientNotification);
    };
  }, [socket]);

  const handleLogout = () => {
    // AuthContext se encarga de limpiar el estado
    logout();
    // SocketContext se encargará de cerrar la conexión al detectar el logout
    navigate("/");
  };

  const navigation = [
    { name: "Dashboard", href: "/client/dashboard", icon: LayoutDashboard },
    { name: "Publicaciones", href: "/client/publications", icon: FileText },
    { name: "Calendario", href: "/client/calendar", icon: Calendar },
    {
      name: "Comentarios/Mensajes",
      href: "/client/comments",
      icon: MessageCircle,
      count: unreadNotifications, // 🔔 Conectamos el contador
    },
  ];

  const isActive = (href) =>
    location.pathname === href || location.pathname.startsWith(href + "/");

  const SidebarContent = ({ isMobile = false }) => (
    <>
      {/* Header del Sidebar (estilo AdminLayout) */}
      <div className="relative h-20 px-6 flex items-center justify-between bg-linear-to-r from-indigo-600 to-indigo-700 dark:from-gray-800 dark:to-gray-900 border-b border-indigo-700 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">HASHTAGPE</h1>
        </div>

        {isMobile && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-indigo-600 rounded-lg transition-colors text-white"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                active
                  ? "bg-indigo-700 text-white shadow-lg dark:bg-indigo-600"
                  : "text-indigo-100 hover:bg-indigo-700 hover:text-white dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="w-5 h-5 mr-3 shrink-0" />
              <span className="flex-1">{item.name}</span>
              {/* 🔔 Badge de Notificaciones */}
              {item.count > 0 && (
                <span className="ml-3 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-indigo-700 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-3 mb-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center dark:bg-indigo-500 shadow-md shrink-0">
            <User className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            {/* Nombre y plan (alineado con AdminLayout) */}
            <p className="text-sm font-semibold text-white truncate">
              {user?.name || "Cliente"}
            </p>
            <p className="text-xs text-indigo-200 dark:text-gray-300 truncate">
              Plan: {user?.plan || "SIN PLAN"}
            </p>
            <p className="text-xs text-indigo-300 truncate dark:text-gray-400">
              {user?.companyName || user?.email || "Sin información"}
            </p>
          </div>
        </div>

        {/* 🔴 Botón Cerrar Sesión */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-indigo-100 hover:text-white hover:bg-indigo-700 rounded-lg transition-colors dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </button>
      </div>
    </>
  );

  // Lógica de Carga
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Cargando datos del cliente...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar Desktop */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex flex-col grow overflow-y-auto bg-linear-to-b from-indigo-800 to-indigo-900 dark:from-gray-800 dark:to-gray-900">
          <SidebarContent />
        </div>
      </div>

      {/* Sidebar Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-gray-900 bg-opacity-75 dark:bg-opacity-90"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />

          <div
            className={`fixed inset-y-0 left-0 flex flex-col w-full max-w-xs bg-linear-to-b from-indigo-800 to-indigo-900 dark:from-gray-800 dark:to-gray-900 transform transition-transform duration-300 ease-in-out z-50 ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <SidebarContent isMobile />
          </div>
        </div>
      )}

      {/* Contenido Principal */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Mobile top bar similar a AdminLayout */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-linear-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white">
                <LayoutDashboard className="w-4 h-4" />
              </div>
              <span className="font-semibold text-gray-800 dark:text-white">
                HASHTAGPE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/client/comments"
              className="relative p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Notificaciones"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-red-600"></span>
              )}
            </Link>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ClientLayout;
