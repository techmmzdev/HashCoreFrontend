import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  UserCheck,
  UserX,
  Sparkles,
} from "lucide-react";

// API & context
import {
  getAllClients,
  createClient,
  updateClient,
  deleteClient,
} from "@/api/client";
import toast from "react-hot-toast";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { useAuth } from "../../contexts/AuthContext";

// Components
import ClientCardsView from "@/components/admin/ClientCardsView";
import UserForm from "@/components/admin/UserForm";
import UserDetailsModal from "@/components/admin/UserDetailsModal";

const transformClientsToUsers = (clients) =>
  clients.map((client) => ({
    id: client.user?.id,
    email: client.user?.email,
    name: client.user?.name,
    role: client.user?.role,
    isActive: client.status,
    created_at: client.created_at,
    updated_at: client.updated_at,
    clients: [
      {
        id: client.id,
        company_name: client.company_name,
        contact_name: client.contact_name,
        contact_email: client.contact_email,
        contact_phone: client.contact_phone,
        status: client.status,
        plan: client.plan || "BASIC",
      },
    ],
  }));

const ClientsPage = () => {
  const { isAdmin } = useAuth();

  // data
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // filters & pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // UI modals
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  // Confirmación de borrado
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // form state
  const [userToEdit, setUserToEdit] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // bloquea el scroll si esta abierto el modal
  useEffect(() => {
    if (typeof window === "undefined") return;
    const originalOverflow = document.body.style.overflow;
    if (isFormModalOpen || isDetailsModalOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isFormModalOpen, isDetailsModalOpen]);

  const fetchClients = useCallback(async () => {
    if (!isAdmin) {
      setError("Acceso denegado. Se requiere rol de Administrador.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getAllClients();
      setClients(transformClientsToUsers(data || []));
    } catch (err) {
      console.error("Error al obtener clientes:", err);
      setError(
        err?.response?.data?.message ||
          "Error al cargar la lista de clientes. Verifica el servidor."
      );
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const filteredClients = useMemo(() => {
    const q = (searchTerm || "").toLowerCase();
    return clients.filter((user) => {
      const client = user?.clients?.[0];
      if (!client) return false;

      const company = (client.company_name || "").toLowerCase();
      const email = (user.email || "").toLowerCase();

      const matchesSearch =
        q === "" || email.includes(q) || company.includes(q);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && client.status) ||
        (statusFilter === "inactive" && !client.status);
      const matchesPlan =
        planFilter === "all" || client.plan === planFilter.toUpperCase();

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [clients, searchTerm, statusFilter, planFilter]);

  const stats = useMemo(() => {
    const total = filteredClients.length;
    const active = filteredClients.filter((u) => u.clients?.[0]?.status).length;
    const inactive = total - active;
    return [
      {
        name: "Total Clientes",
        value: total,
        icon: Users,
        color: "from-blue-500 to-blue-600",
        textColor: "text-blue-600",
        bgLight: "bg-blue-50",
        darkBg: "dark:bg-blue-900/30",
      },
      {
        name: "Clientes Activos",
        value: active,
        icon: UserCheck,
        color: "from-green-500 to-green-600",
        textColor: "text-green-600",
        bgLight: "bg-green-50",
        darkBg: "dark:bg-green-900/30",
      },
      {
        name: "Clientes Inactivos",
        value: inactive,
        icon: UserX,
        color: "from-red-500 to-red-600",
        textColor: "text-red-600",
        bgLight: "bg-red-50",
        darkBg: "dark:bg-red-900/30",
      },
    ];
  }, [filteredClients]);

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / pageSize));
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredClients.slice(start, start + pageSize);
  }, [filteredClients, currentPage, pageSize]);

  // actions
  const handleOpenCreate = () => {
    setUserToEdit(null);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = useCallback((user) => {
    setUserToEdit(user);
    setFormError(null);
    setIsFormModalOpen(true);
  }, []);

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setUserToEdit(null);
  };

  const handleSubmitForm = async (userId, payload) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      if (userId) {
        await updateClient(userId, payload);
        toast.success("Cliente actualizado correctamente."); // ✅ toast actualización
      } else {
        await createClient(payload);
        toast.success("Cliente creado correctamente."); // ✅ toast creación
      }

      await fetchClients();
      handleCloseFormModal();
    } catch (err) {
      console.error("Error al guardar cliente:", err);
      setFormError(
        err?.response?.data?.message ||
          "Error al procesar la solicitud. Verifica los datos."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePageChange = (page) => {
    const p = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(p);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value) || 8);
    setCurrentPage(1);
  };

  const handleOpenDelete = useCallback((user) => {
    setUserToDelete(user); // user.id debe ser users.id
    setIsDeleteConfirmOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!userToDelete) return;

    const userId = userToDelete.id; // ✅ users.id
    try {
      setIsSubmitting(true);
      await deleteClient(userId); // llama a DELETE /users/:id
      toast.success("Cliente eliminado correctamente.");
      fetchClients();
    } catch (err) {
      console.error("Error eliminando cliente:", err);
      toast.error(err?.response?.data?.message || "Error al eliminar cliente.");
    } finally {
      setIsSubmitting(false);
      setIsDeleteConfirmOpen(false);
      setUserToDelete(null);
    }
  }, [userToDelete, fetchClients]);

  const handleOpenDetailsModal = useCallback((user) => {
    setSelectedUserDetails(user);
    setIsDetailsModalOpen(true);
  }, []);

  const handleCloseDetailsModal = useCallback(() => {
    setIsDetailsModalOpen(false);
    setSelectedUserDetails(null);
  }, []);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-gray-600 dark:text-gray-400">
        <div className="relative w-16 h-16 mb-4">
          <Users className="w-16 h-16 text-indigo-600 dark:text-indigo-400 animate-pulse" />
          <Sparkles className="w-6 h-6 text-indigo-400 absolute bottom-0 right-0 animate-spin" />
        </div>
        <p className="text-lg font-medium">Cargando clientes...</p>
      </div>
    );

  if (error)
    return (
      <div className="p-6 bg-linear-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border border-red-200 dark:border-red-700/50 rounded-xl">
        <div className="flex items-start gap-3">
          <UserX className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900 dark:text-red-300">
              Error al cargar los clientes
            </p>
            <p className="text-red-800 dark:text-red-400 text-sm mt-1">
              {error}
            </p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="space-y-8 pb-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-2">
            Gestión de Clientes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Administra y monitorea todos tus clientes en un solo lugar
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold rounded-lg transition-transform shadow-sm hover:shadow-md"
          >
            <Plus className="w-5 h-5" />
            Crear Cliente
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <article
              key={stat.name}
              className={`${stat.bgLight} ${stat.darkBg} dark:bg-gray-800/50 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700/50 overflow-hidden`}
            >
              <div className="p-5 flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                    {stat.name}
                  </p>
                  <div
                    className={`text-3xl sm:text-4xl font-bold ${stat.textColor}`}
                  >
                    {stat.value}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="bg-white dark:bg-gray-800/50 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700/50 p-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por email o empresa..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900"
            >
              <option value="all">📊 Todos los estados</option>
              <option value="active">✅ Activos</option>
              <option value="inactive">❌ Inactivos</option>
            </select>

            <select
              value={planFilter}
              onChange={(e) => {
                setPlanFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900"
            >
              <option value="all">🎁 Todos los planes</option>
              <option value="BASIC">⭐ Básico</option>
              <option value="STANDARD">⭐⭐ Estándar</option>
              <option value="FULL">⭐⭐⭐ Premium</option>
            </select>
          </div>
        </div>
      </section>

      <ClientCardsView
        users={paginatedClients}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onOpenDetails={handleOpenDetailsModal}
      />

      <section className="bg-white dark:bg-gray-800/50 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700/50 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm text-gray-700 dark:text-gray-400">
            Mostrando{" "}
            <span className="font-bold text-gray-900 dark:text-white">
              {filteredClients.length === 0
                ? 0
                : (currentPage - 1) * pageSize + 1}
            </span>{" "}
            a{" "}
            <span className="font-bold text-gray-900 dark:text-white">
              {Math.min(currentPage * pageSize, filteredClients.length)}
            </span>{" "}
            de{" "}
            <span className="font-bold text-gray-900 dark:text-white">
              {filteredClients.length}
            </span>{" "}
            clientes
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Items:
              </span>
              <select
                value={pageSize}
                onChange={handlePageSizeChange}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900"
              >
                {[4, 8, 12, 24].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <span className="px-3 py-1 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg">
                {totalPages === 0 ? 0 : currentPage} / {totalPages}
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <UserForm
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        initialUser={userToEdit}
        onSubmit={handleSubmitForm}
        isLoading={isSubmitting}
        error={formError}
      />

      <UserDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        user={selectedUserDetails}
      />

      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={() => confirmDelete()}
        user={userToDelete}
        title={`Eliminar cliente`}
        message={`¿Seguro que deseas eliminar al cliente ${
          userToDelete?.name || userToDelete?.id || ""
        }? Esta acción no se puede deshacer.`}
      />
    </div>
  );
};

export default ClientsPage;
