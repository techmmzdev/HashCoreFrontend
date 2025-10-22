import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Users,
  Menu,
  X,
  LogOut,
  Bell,
  FileText,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingPublicationsCount, setPendingPublicationsCount] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();

  // Desactivar scroll en body cuando el sidebar móvil esté abierto
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [sidebarOpen]);

  // Cerrar sidebar cuando se cambie de ruta
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Socket listener
  useEffect(() => {
    if (!socket) return;

    const handleNewPublication = () => {
      setPendingPublicationsCount((prev) => prev + 1);
    };

    socket.on("new_publication_pending", handleNewPublication);
    return () => socket.off("new_publication_pending", handleNewPublication);
  }, [socket]);

  const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Clientes", href: "/admin/clients", icon: Users },
    { name: "Administradores", href: "/admin/admins", icon: User },
    {
      name: "Reportes",
      href: "/admin/reports",
      icon: FileText,
      count: pendingPublicationsCount,
    },
  ];

  const isActive = (href) =>
    location.pathname === href || location.pathname.startsWith(href + "/");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const SidebarContent = ({ isMobile = false }) => (
    <>
      {/* Header del Sidebar */}
      <div className="relative h-20 px-6 flex items-center justify-between bg-linear-to-r from-indigo-600 to-indigo-700 dark:from-gray-800 dark:to-gray-900 border-b border-indigo-700 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Panel Admin</h1>
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

      {/* Navegación */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-600 scrollbar-track-transparent hover:scrollbar-thumb-indigo-500">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                active
                  ? "bg-white/15 text-white shadow-md backdrop-blur-sm border border-white/20"
                  : "text-indigo-100 hover:bg-indigo-600 hover:text-white dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
              aria-current={active ? "page" : undefined}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white dark:bg-indigo-400 rounded-r-full"></div>
              )}
              <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="flex-1">{item.name}</span>
              {item.count > 0 && (
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full shadow-lg hover:bg-red-600 transition-colors">
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Usuario y Cerrar Sesión */}
      <div className="border-t border-indigo-700 dark:border-gray-700 p-4 bg-indigo-700/50 dark:bg-gray-800/50 space-y-4">
        <div className="flex items-center gap-3 px-2">
          <div className="w-12 h-12 rounded-lg bg-linear-to-br from-indigo-300 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user?.name || "Administrador"}
            </p>
            <p className="text-xs text-indigo-200 dark:text-gray-400 truncate">
              {user?.role || "Admin"}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-indigo-100 bg-indigo-600/50 hover:bg-indigo-600 hover:text-white rounded-lg transition-all duration-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile top bar: show title and hamburger */}
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
              Panel Admin
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Notificaciones"
          >
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </header>
      {/* Sidebar escritorio */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col grow bg-linear-to-b from-indigo-600 via-indigo-700 to-indigo-900 dark:from-gray-800 dark:via-gray-900 dark:to-gray-900 shadow-2xl">
          <SidebarContent />
        </div>
      </div>

      {/* Sidebar móvil */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <div
            className={`fixed inset-y-0 left-0 flex flex-col w-full max-w-xs bg-linear-to-b from-indigo-600 via-indigo-700 to-indigo-900 dark:from-gray-800 dark:via-gray-900 dark:to-gray-900 transform transition-transform duration-300 ease-in-out z-50 shadow-2xl ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <SidebarContent isMobile />
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent hover:scrollbar-thumb-gray-500">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
