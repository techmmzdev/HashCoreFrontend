import { useNavigate } from "react-router-dom";
import { ShieldOff, ArrowLeft, Home, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden py-8 px-4">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 bg-linear-to-br from-black/80 via-black/70 to-black/85"></div>
      </div>

      <div className="relative z-10 w-full max-w-3xl my-auto">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 sm:p-12 space-y-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-400 mx-auto mb-4">
            <ShieldOff className="w-8 h-8 text-black" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Acceso no autorizado
          </h2>
          <p className="text-gray-600">
            No tienes permisos para acceder a esta sección.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 py-2.5 px-4 rounded-lg bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Volver
            </button>

            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 py-2.5 px-4 rounded-lg bg-yellow-400 text-black font-semibold hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
            >
              <Home className="w-4 h-4" /> Ir al inicio
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 py-2.5 px-4 rounded-lg bg-red-50 border border-red-300 text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300 transition"
            >
              <LogOut className="w-4 h-4" /> Cerrar sesión
            </button>
          </div>

          <div className="text-xs text-gray-500 mt-4">
            Si crees que esto es un error, contacta con soporte.
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
