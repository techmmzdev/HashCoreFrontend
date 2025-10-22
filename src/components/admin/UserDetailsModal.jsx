import React, { useEffect, useRef, memo } from "react";
import {
  X,
  Mail,
  Phone,
  User,
  Building2,
  Calendar,
  Star,
  Crown,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

// Subcomponente reutilizable (memoizado)
const InfoItem = memo(({ icon: Icon, label, value }) => (
  <div className="flex items-start text-gray-600 dark:text-gray-300">
    {Icon && (
      <Icon className="w-5 h-5 text-blue-500 dark:text-blue-400 mr-3 shrink-0" />
    )}
    <div>
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {label}
      </span>
      <p className="text-sm font-semibold text-gray-900 dark:text-white">
        {value ?? "No disponible"}
      </p>
    </div>
  </div>
));

const UserDetailsModal = ({ isOpen, onClose, user }) => {
  const modalRef = useRef(null);
  const closeBtnRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && modalRef.current) {
        const focusable = Array.from(
          modalRef.current.querySelectorAll(
            'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
          )
        ).filter(Boolean);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // focus al botón close al abrir
    const t = setTimeout(() => closeBtnRef.current?.focus(), 0);

    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const client = user.role === "CLIENTE" ? user.clients?.[0] : null;
  const isActive = user.isActive ?? client?.status === true;

  const formatDate = (d) => {
    if (!d) return "No disponible";
    const date = new Date(d);
    if (isNaN(date)) return "Fecha inválida";
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getPlanBadge = (plan) => {
    const map = {
      BASIC: {
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        icon: Star,
        label: "Básico",
      },
      STANDARD: {
        color:
          "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
        icon: Crown,
        label: "Estándar",
      },
      FULL: {
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        icon: Shield,
        label: "Premium",
      },
    };
    const cfg = map[plan] || map.BASIC;
    const Icon = cfg.icon;
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${cfg.color}`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {cfg.label}
      </span>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 md:bg-transparent backdrop-blur-sm md:backdrop-blur-0 min-h-screen"
      role="dialog"
      aria-modal="true"
      // onClick={onClose}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-h-[80vh] p-0 sm:p-0 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        aria-labelledby="user-details-title"
      >
        {/* Header */}
        <div className="p-6 sm:p-8 flex items-center justify-between border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h3
            id="user-details-title"
            className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"
          >
            <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            {user.role === "CLIENTE"
              ? "Detalles del Cliente"
              : "Detalles del Administrador"}
          </h3>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Cerrar"
            className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div
          className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 no-scrollbar"
          style={{
            WebkitOverflowScrolling: "touch",
            scrollBehavior: "smooth",
          }}
        >
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
            <div className="flex items-center gap-4 mb-3">
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md ${
                  isActive
                    ? "bg-linear-to-br from-green-500 to-emerald-600"
                    : "bg-linear-to-br from-blue-500 to-indigo-600"
                }`}
              >
                {user.role === "CLIENTE" && client?.company_name
                  ? client.company_name.charAt(0).toUpperCase()
                  : user.email?.charAt(0).toUpperCase() ?? "U"}
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                  {user.role === "CLIENTE"
                    ? client?.company_name ?? "Empresa"
                    : user.name ?? "Administrador"}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                  isActive
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                }`}
              >
                {isActive ? (
                  <CheckCircle className="w-3 h-3 mr-1" />
                ) : (
                  <XCircle className="w-3 h-3 mr-1" />
                )}
                {isActive ? "Activo" : "Inactivo"}
              </span>
              {user.role === "CLIENTE" &&
                client?.plan &&
                getPlanBadge(client.plan)}
            </div>
          </div>

          {/* User info */}
          <section>
            <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <User className="w-3.5 h-3.5" />
              Información del Usuario
            </h4>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem
                icon={User}
                label="Nombre"
                value={user.name ?? "Sin nombre"}
              />
              <InfoItem
                icon={Mail}
                label="Correo"
                value={user.email ?? "No disponible"}
              />
              <InfoItem
                icon={User}
                label="Rol"
                value={user.role === "ADMIN" ? "Administrador" : "Cliente"}
              />
              <InfoItem
                icon={Calendar}
                label="Registro"
                value={formatDate(user.created_at)}
              />
            </div>
          </section>

          {/* Client info */}
          {user.role === "CLIENTE" && client && (
            <section>
              <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5" />
                Información de la Empresa
              </h4>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem
                  icon={Building2}
                  label="Empresa"
                  value={client.company_name}
                />
                <InfoItem
                  icon={User}
                  label="Contacto"
                  value={client.contact_name}
                />
                <InfoItem
                  icon={Mail}
                  label="Email contacto"
                  value={client.contact_email}
                />
                <InfoItem
                  icon={Phone}
                  label="Teléfono"
                  value={client.contact_phone}
                />
              </div>
            </section>
          )}

          {/* Activity */}
          <section>
            <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              Actividad Reciente
            </h4>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Última actualización
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(user.updated_at)}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer (fixed area) */}
        <div className="border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
