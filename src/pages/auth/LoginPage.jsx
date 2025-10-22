import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
// 🛑 CORRECCIÓN: Usar el alias @ y el hook de AuthContext
import { useAuth } from "@/contexts/AuthContext";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Eliminamos 'successMessage' ya que el login solo tiene éxito o falla.
  // const [successMessage, setSuccessMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Referencia al input de contraseña para poder enfocarlo tras un error
  const passwordRef = useRef(null);

  // 🔑 useAuth ahora provee 'login' (que hace toda la lógica) y 'logout'
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.email || !formData.password) {
      setError("Por favor, completa todos los campos requeridos.");
      setLoading(false);
      return;
    }

    try {
      // 🛑 CORRECCIÓN CLAVE: El hook useAuth().login ya maneja la llamada a la API,
      // la decodificación del token, el guardado en localStorage y la actualización del estado.
      // Retorna el objeto 'user' decodificado: { id, email, role, clientId }
      const user = await login(formData.email, formData.password);

      // 🛑 CORRECCIÓN DE REDIRECCIÓN: Usamos el objeto 'user' devuelto
      if (user.role === "ADMIN") {
        navigate("/admin", { replace: true }); // Redirige a la ruta base de admin
      } else if (user.role === "CLIENTE") {
        navigate("/client", { replace: true }); // Redirige a la ruta base de cliente
      } else {
        // Esta parte es menos probable con la validación del backend, pero es buena práctica.
        setError(
          "Inicio de sesión exitoso, pero el rol de usuario no es reconocido. Por favor, contacta a soporte."
        );
        // No se llama a logout() aquí directamente, pero se dejará que el usuario intente de nuevo
        // o que el AuthContext lo maneje si el token es nulo.
      }
    } catch (err) {
      // 'err' es una cadena con el mensaje devuelto por el backend o por el catch.
      const message = String(err || "Error al iniciar sesión");
      setError(message);

      // Limpieza condicional según el tipo de error solicitado:
      // - Si el usuario no existe o la cuenta está inactiva: limpiar email y password, enfocar email.
      // - Si las credenciales son inválidas: limpiar solo password, enfocar password.
      try {
        if (
          message.includes("Usuario no encontrado") ||
          message.includes("inactiva")
        ) {
          setFormData((prev) => ({ ...prev, email: "", password: "" }));
          const emailInput = document.getElementById("email");
          emailInput?.focus();
        } else if (message.includes("Credenciales inválidas")) {
          setFormData((prev) => ({ ...prev, password: "" }));
          passwordRef.current?.focus();
        } else {
          // Comportamiento por defecto: limpiar solo la contraseña
          setFormData((prev) => ({ ...prev, password: "" }));
          passwordRef.current?.focus();
        }
      } catch {
        /* noop */
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden py-8 px-4">
      {/* ... (Todo tu diseño Tailwind es perfecto y se mantiene) ... */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 bg-linear-to-br from-black/80 via-black/70 to-black/85"></div>
      </div>

      <div className="relative z-10 w-full max-w-md my-auto">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-yellow-500 mb-3">
              <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-black" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              Bienvenido a <span className="text-yellow-500">HASHTAGPe</span>
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo Email (Se mantiene) */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs sm:text-sm font-medium text-gray-700"
              >
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  aria-label="Correo electrónico"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            {/* Campo Contraseña (Se mantiene) */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs sm:text-sm font-medium text-gray-700"
              >
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  aria-label="Contraseña"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                  placeholder="Tu contraseña"
                  ref={passwordRef}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Mensajes */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm">
                <p className="font-medium">Error de inicio de sesión</p>
                <p className="mt-0.5">{error}</p>
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2.5 sm:py-3 px-4 border border-transparent rounded-lg text-black text-sm font-semibold bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-black"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center text-xs sm:text-sm text-gray-600 pt-2">
            ¿Olvidaste tu contraseña?
            <a
              href="#"
              className="font-medium text-yellow-600 hover:text-yellow-500 transition-colors"
            >
              Recupérala aquí
            </a>
          </div>
        </div>

        {/* Derechos */}
        <div className="text-center mt-4 sm:mt-6 text-white/80 text-xs sm:text-sm">
          <p>© 2025 Hashtag Pe — Marketing & Publicidad</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
