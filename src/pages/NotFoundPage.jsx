import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden py-8 px-4">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 bg-linear-to-br from-black/80 via-black/70 to-black/85"></div>
      </div>

      <div className="relative z-10 w-full max-w-3xl my-auto">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 sm:p-12 space-y-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-400 mx-auto mb-4">
            <h1 className="text-3xl font-bold text-black">404</h1>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Página no encontrada
          </h2>
          <p className="text-gray-600">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 py-2.5 px-4 rounded-lg bg-yellow-400 text-black font-semibold hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Volver
            </button>
          </div>

          <div className="text-xs text-gray-500 mt-4">
            © 2025 Hashtag Pe — Marketing & Publicidad
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
