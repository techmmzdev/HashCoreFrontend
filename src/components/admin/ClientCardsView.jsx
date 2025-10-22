import React, { useState, useEffect, useCallback, memo, useRef } from "react";
import {
  Edit,
  Trash,
  Shield,
  Eye,
  MoreVertical,
  Star,
  Crown,
  CheckCircle,
  XCircle,
  FileText,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import UserDetailsModal from "@/components/admin/UserDetailsModal";
import toast from "@/utils/toast";

// --- Badge del Plan ---
const PlanBadge = memo(({ plan }) => {
  const planConfig = {
    BASIC: {
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
      icon: Star,
      label: "Básico",
    },
    STANDARD: {
      color:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300",
      icon: Crown,
      label: "Estándar",
    },
    FULL: {
      color:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
      icon: Shield,
      label: "Premium",
    },
  };

  const config = planConfig[plan] || planConfig.BASIC;
  const IconComponent = config.icon;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.color}`}
    >
      <IconComponent className="w-3 h-3 mr-1.5" />
      {config.label}
    </span>
  );
});

// --- Tarjeta de Cliente ---
const ClientCard = memo(
  ({
    user,
    activeDropdown,
    onToggleDropdown,
    onEdit,
    onDelete,
    onOpenDetails,
    onViewPublications,
  }) => {
    const client = user.clients?.[0];
    const isActive = client?.status;
    const dropdownRef = useRef(null);
    const [dropdownPosition, setDropdownPosition] = useState("bottom");

    useEffect(() => {
      if (activeDropdown !== user.id) return;

      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          onToggleDropdown(null);
        }
      };

      // Compute dropdown position on next frame to avoid layout thrash
      const raf = requestAnimationFrame(() => {
        const rect = dropdownRef.current?.getBoundingClientRect();
        if (rect && rect.bottom + 200 > window.innerHeight)
          setDropdownPosition("top");
        else setDropdownPosition("bottom");
      });

      document.addEventListener("mousedown", handleClickOutside);

      return () => {
        cancelAnimationFrame(raf);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [activeDropdown, user.id, onToggleDropdown]);

    // handleAction removed: callbacks now validate existence and call onToggleDropdown inside each handler

    return (
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") onOpenDetails(user);
        }}
        className="group bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 transition-shadow duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {/* Header de estado */}
        <div
          className={`h-2 rounded-t-2xl ${
            isActive
              ? "bg-linear-to-r from-green-400 to-emerald-500"
              : "bg-linear-to-r from-red-400 to-rose-500"
          }`}
        />

        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            {/* Info básica */}
            <div className="flex items-center space-x-4 min-w-0">
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-inner ${
                  isActive
                    ? "bg-linear-to-br from-green-500 to-emerald-600"
                    : "bg-linear-to-br from-gray-500 to-gray-600"
                }`}
              >
                {client?.company_name
                  ? client.company_name.charAt(0).toUpperCase()
                  : user.email.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 truncate">
                  {client?.company_name || "Empresa sin nombre"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Dropdown acciones */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleDropdown(user.id);
                }}
                className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {activeDropdown === user.id && (
                <div
                  className={`absolute right-0 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 py-1 ${
                    dropdownPosition === "top"
                      ? "bottom-full mb-2"
                      : "top-full mt-2"
                  }`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (typeof onOpenDetails === "function")
                        onOpenDetails(user);
                      else toast.error("Acción no disponible: ver detalles.");
                      onToggleDropdown(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-3" /> Ver detalles
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (typeof onEdit === "function") onEdit(user);
                      else toast.error("Acción no disponible: editar.");
                      onToggleDropdown(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-3" /> Editar
                  </button>

                  <hr className="my-1 border-gray-200 dark:border-gray-700" />

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (typeof onDelete === "function") onDelete(user);
                      else toast.error("Acción no disponible: eliminar.");
                      onToggleDropdown(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/40 flex items-center"
                  >
                    <Trash className="w-4 h-4 mr-3" /> Eliminar
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Estado y plan */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isActive
                    ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                    : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                }`}
              >
                {isActive ? (
                  <CheckCircle className="w-3 h-3 mr-1.5" />
                ) : (
                  <XCircle className="w-3 h-3 mr-1.5" />
                )}
                {isActive ? "Activo" : "Inactivo"}
              </span>
              {client?.plan && <PlanBadge plan={client.plan} />}
            </div>
            <button
              onClick={() => client?.id && onViewPublications(client.id)}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-blue-600 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors"
              title="Ver publicaciones"
            >
              <FileText className="w-4 h-4 mr-1.5" />
              Publicaciones
            </button>
          </div>
        </div>
      </div>
    );
  }
);

// --- Componente Principal ---
const ClientCardsView = ({ users, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);

  const handleToggleDropdown = useCallback(
    (userId) => setActiveDropdown((prev) => (prev === userId ? null : userId)),
    []
  );

  const handleOpenDetailsModal = useCallback((user) => {
    setSelectedUserDetails(user);
    setIsDetailsModalOpen(true);
  }, []);

  const handleCloseDetailsModal = useCallback(() => {
    setIsDetailsModalOpen(false);
    setSelectedUserDetails(null);
  }, []);

  const handleViewPublications = useCallback(
    (clientId) => navigate(`/admin/publications/client/${clientId}`),
    [navigate]
  );

  if (!users || users.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 rounded-2xl text-center border-2 border-dashed border-gray-200 dark:border-gray-700 py-10 px-6">
        <div className="w-20 h-20 mx-auto mb-3 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <User className="w-10 h-10 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-1">
          No hay usuarios registrados
        </h3>
        <p className="text-sm">
          Comienza creando tu primer cliente para gestionar sus publicaciones
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 items-stretch">
        {users.map((user) => (
          <ClientCard
            key={user.id}
            user={user}
            activeDropdown={activeDropdown}
            onToggleDropdown={handleToggleDropdown}
            onOpenDetails={handleOpenDetailsModal}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewPublications={handleViewPublications}
          />
        ))}
      </div>
      <UserDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        user={selectedUserDetails}
      />
    </>
  );
};

export default ClientCardsView;
