import React, { useCallback, memo } from "react";
import { Shield } from "lucide-react";

// --- Fila de Administrador (AdminRow) ---
const AdminRow = memo(({ user, formatDate }) => (
  <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center">
        <div className="shrink-0 h-10 w-10 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
          {user.name
            ? user.name.charAt(0).toUpperCase()
            : user.email.charAt(0).toUpperCase()}
        </div>
        <div className="ml-4">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {user.name || "Sin nombre"}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {user.email}
          </div>
        </div>
      </div>
    </td>

    <td className="px-6 py-4 whitespace-nowrap">
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
        <Shield className="w-3 h-3 mr-1.5" /> {user.role}
      </span>
    </td>

    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
      {formatDate(user.created_at)}
    </td>

    {/* Columna de Acciones */}
    <td className="px-6 py-4 whitespace-nowrap text-right">
      <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 border border-gray-300 dark:border-gray-600">
        <span className="inline-block w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full mr-2"></span>
        Solo lectura
      </span>
    </td>
  </tr>
));

// --- Componente Principal de la Tabla ---
const AdminTable = ({ admins = [] }) => {
  const formatDate = useCallback(
    (dateString) =>
      new Date(dateString).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    []
  );

  // Si no hay admins
  if (!admins.length) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        No hay administradores registrados.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto shadow-lg rounded-b-lg">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Administrador
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Rol
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Fecha de Creación
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>

        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
          {admins.map((user) => (
            <AdminRow key={user.id} user={user} formatDate={formatDate} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTable;
