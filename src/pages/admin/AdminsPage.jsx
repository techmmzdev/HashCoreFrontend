import React, { useState, useEffect, useCallback } from "react";
import { getAllUsers, createNewUser, updateUser, deleteUser } from "@/api/user";
import UserForm from "@/components/admin/UserForm";
import AdminTable from "@/components/admin/AdminTable";

// Iconos
import { Plus, Loader2, Users, AlertTriangle, CheckCircle } from "lucide-react";
import { success as toastSuccess, error as toastError } from "@/utils/toast";

const AdminsPage = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [mutationLoading, setMutationLoading] = useState(false);

  // -------------------- CARGA DE DATOS --------------------
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllUsers();
      setAllUsers(data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Error al cargar la lista de usuarios."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // -------------------- FILTRADO --------------------
  const adminUsers = allUsers.filter((user) => user.role === "ADMIN");

  // -------------------- HANDLERS DE UI --------------------
  const handleOpenModal = (user = null) => {
    setUserToEdit(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setUserToEdit(null);
    setError(null);
  };

  // -------------------- HANDLERS DE MUTACIÓN --------------------
  const handleSubmitForm = async (userId, userData) => {
    setMutationLoading(true);
    setError(null);
    const isEditing = !!userId;

    // Forzar rol ADMIN
    userData.role = "ADMIN";

    try {
      if (isEditing) {
        await updateUser(userId, userData);
        const msg = "Administrador actualizado correctamente.";
        toastSuccess(msg);
      } else {
        await createNewUser(userData);
        const msg = "Nuevo administrador creado exitosamente.";
        toastSuccess(msg);
      }

      // Refrescar la lista y esperar a que termine antes de cerrar el modal
      await fetchUsers();
      handleCloseModal();
    } catch (err) {
      const errMsg = err.response?.data?.message || "Error en la operación.";
      setError(errMsg);
      toastError(errMsg);
    } finally {
      setMutationLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (
      !window.confirm(
        "¿Estás seguro de que quieres eliminar este administrador? Esta acción es irreversible."
      )
    ) {
      return;
    }

    setMutationLoading(true);
    setError(null);

    try {
      await deleteUser(userId);
      const msg = "Administrador eliminado correctamente.";
      toastSuccess(msg);
      await fetchUsers();
    } catch (err) {
      setError(
        err.response?.data?.message || "Error al eliminar el administrador."
      );
      toastError(
        err.response?.data?.message || "Error al eliminar el administrador."
      );
    } finally {
      setMutationLoading(false);
    }
  };

  // -------------------- RENDER --------------------
  return (
    <div className="p-6 md:p-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center">
          <Users className="w-7 h-7 mr-3 text-indigo-600" />
          Gestión de Administradores
        </h1>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
        >
          <Plus className="w-5 h-5 mr-2" />
          Crear Admin
        </button>
      </div>

      {/* Mensajes de estado */}

      {error && !isModalOpen && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg dark:bg-red-900 dark:border-red-700 dark:text-red-300 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* Tabla o loader */}
      {loading ? (
        <div className="flex justify-center items-center h-40 text-indigo-600 dark:text-indigo-400">
          <Loader2 className="w-8 h-8 animate-spin mr-3" />
          Cargando administradores...
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 shadow-xl rounded-xl overflow-hidden">
          <AdminTable
            admins={adminUsers}
            onEdit={handleOpenModal}
            onDelete={handleDelete}
            isMutating={mutationLoading}
          />
        </div>
      )}

      {/* Modal de Formulario */}
      <UserForm
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialUser={userToEdit}
        onSubmit={handleSubmitForm}
        isLoading={mutationLoading}
        error={error}
        mode="admin"
      />
    </div>
  );
};

export default AdminsPage;
