import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  ChevronLeft,
  Edit,
  Trash2,
  Search,
  Image,
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  MessageSquare, // Icono de comentarios del segundo código
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "@/utils/toast";

// Componentes importados del código original
import PublicationForm from "@/components/admin/PublicationForm";
import MediaModal from "@/components/admin/MediaModal";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import PublicationCommentsModal from "@/components/admin/PublicationCommentsModal";
import {
  getPublicationsByClient as apiGetPublicationsByClient,
  createPublication as apiCreatePublication,
  updatePublication as apiUpdatePublication,
  deletePublication as apiDeletePublication,
} from "@/api/publication";
import { getClientById as apiGetClientById } from "@/api/client";

// URL base para media (usada en el segundo código, se incluye por consistencia de diseño)
const UPLOADS_BASE_URL = (import.meta.env.VITE_UPLOADS_URL || "").replace(
  /\/$/,
  ""
);
const getMediaUrl = (url, baseUrl) => {
  if (!url) return null;
  const cleanUrl = url.replace(/^\//, "");
  return `${baseUrl}/${cleanUrl}`;
};

const ClientPublicationsPage = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const clientNumericId = parseInt(clientId, 10);

  // Estados del primer código
  const [publications, setPublications] = useState([]);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL"); // Filtro de estado (usar mayúsculas para normalizar)

  // Estados fusionados para modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false); // Para PublicationForm
  const [publicationToEdit, setPublicationToEdit] = useState(null); // Usado por PublicationForm
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false); // Para MediaModal
  const [selectedPublicationForMedia, setSelectedPublicationForMedia] =
    useState(null); // Usado por MediaModal

  // Nuevos estados del segundo código (para mantener compatibilidad en el renderizado)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); // Para el modal de confirmación de borrado
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false); // Para el modal de comentarios

  // Lógica de FETCH (del primer código)
  const fetchPublications = useCallback(async () => {
    if (!clientId) return;
    try {
      setLoading(true);
      setError(null);
      const clientData = await apiGetClientById(clientId);
      const data = await apiGetPublicationsByClient(clientId);
      setClient(clientData);
      setPublications(data || []);
    } catch (err) {
      console.error(err);
      setError("Error al cargar las publicaciones del cliente.");
      toast.error("Error al cargar las publicaciones.");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchPublications();
  }, [fetchPublications]);

  // Lógica de FILTRADO (del primer código)
  const filteredPublications = useMemo(() => {
    const lower = searchTerm.trim().toLowerCase();

    return publications.filter((pub) => {
      const matchesSearch =
        !lower ||
        (pub.title || "").toLowerCase().includes(lower) ||
        (pub.content_type || "").toLowerCase().includes(lower) ||
        (pub.content || "").toLowerCase().includes(lower);

      // Normalizamos ambos a mayúsculas para comparar contra enums del backend
      const pubStatusUpper = (pub.status || "").toString().toUpperCase();
      const filterStatus = (selectedStatus || "").toString().toUpperCase();

      const matchesStatus =
        filterStatus === "ALL" || pubStatusUpper === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [publications, searchTerm, selectedStatus]);

  // Lógica de ESTADÍSTICAS (del primer código)
  const stats = useMemo(
    () => ({
      total: publications.length,
      // Normalizamos status (el backend puede devolver enums en mayúsculas)
      published: publications.filter(
        (p) => (p.status || "").toString().toUpperCase() === "PUBLISHED"
      ).length,
      draft: publications.filter(
        (p) => (p.status || "").toString().toUpperCase() === "DRAFT"
      ).length,
      scheduled: publications.filter(
        (p) => (p.status || "").toString().toUpperCase() === "SCHEDULED"
      ).length,
    }),
    [publications]
  );

  // Lógica de MANEJADORES DE MODALES (del primer código)

  const handleOpenCreate = () => {
    setPublicationToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (publication) => {
    setPublicationToEdit(publication);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setPublicationToEdit(null);
  };

  const handleOpenMediaModal = (publication) => {
    setSelectedPublicationForMedia(publication);
    setIsMediaModalOpen(true);
  };

  // Nuevos/Actualizados manejadores del segundo diseño (manteniendo la lógica del primero)

  const handleOpenConfirmDelete = (publication) => {
    setPublicationToEdit(publication); // Usamos publicationToEdit para el modal de confirmación
    setIsConfirmModalOpen(true);
  };

  const handleOpenCommentsModal = (publication) => {
    setSelectedPublicationForMedia(publication); // Usamos selectedPublicationForMedia para comentarios
    setIsCommentsModalOpen(true);
  };

  // Lógica de MUTATIONS (del primer código)

  const handleSavePublication = async (data) => {
    if (!clientId) return;
    setIsSubmitting(true);
    const isEditing = !!data.id;
    try {
      const promise = isEditing
        ? apiUpdatePublication(data.id, data)
        : apiCreatePublication(clientId, data);

      await toast.promise(promise, {
        loading: isEditing
          ? "Actualizando publicación..."
          : "Creando publicación...",
        success: isEditing
          ? "Publicación actualizada con éxito."
          : "Publicación creada con éxito.",
        error: (err) =>
          `Error al ${isEditing ? "actualizar" : "crear"}: ${
            err?.response?.data?.message || err?.message || "Intenta de nuevo"
          }`,
      });

      handleCloseFormModal();
      await fetchPublications();
    } catch (err) {
      // toast.promise ya muestra el error, aquí podemos loggear si es necesario
      console.error("Error en handleSavePublication:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async (id) => {
    if (!id) {
      // fallback to publicationToEdit
      id = publicationToEdit?.id;
    }
    if (!id) return;
    try {
      await toast.promise(apiDeletePublication(id), {
        loading: "Eliminando publicación...",
        success: "Publicación eliminada con éxito.",
        error: (err) =>
          err?.response?.data?.message || "Error al eliminar publicación.",
      });

      setIsConfirmModalOpen(false);
      setPublicationToEdit(null);
      await fetchPublications();
    } catch (err) {
      console.error("Error en confirmDelete:", err);
    }
  };

  // Estado de carga y error (Diseño del segundo código)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 border-b-2 border-indigo-600 rounded-full mx-auto mb-4 text-indigo-600 dark:text-indigo-400" />
          <p className="text-gray-600 dark:text-gray-300">
            Cargando publicaciones...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="p-8 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            <p className="text-red-600 dark:text-red-400 font-semibold">
              Error
            </p>
          </div>
          <p className="text-red-500 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  // Nombre de la empresa para el header
  const companyName = client?.company_name || `Cliente #${clientNumericId}`;

  // Renderizado principal (Diseño del segundo código con elementos del primero)
  return (
    <div>
      {/* Header Sticky (Diseño del segundo código) */}
      <div className="sticky top-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm z-10">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => navigate("/admin/clients")}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 dark:text-gray-300" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Publicaciones de
                </h1>
                <p className="text-indigo-600 dark:text-indigo-400 font-semibold">
                  {companyName}
                </p>
              </div>
            </div>
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 bg-linear-to-r from-indigo-600 to-indigo-700 text-white px-4 py-2 rounded-lg shadow hover:shadow-lg hover:scale-105 transition"
            >
              <Plus className="h-5 w-5" />
              Crear Publicación
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards (Diseño del primer código, adaptado al nuevo tema) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  Total
                </p>
                <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.total}
                </p>
              </div>
              <div className="text-3xl">📊</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  Publicadas
                </p>
                <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.published}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500 dark:text-green-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  Borradores
                </p>
                <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.draft}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500 dark:text-yellow-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  Programadas
                </p>
                <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.scheduled}
                </p>
              </div>
              <Clock className="h-8 w-8 text-indigo-500 dark:text-indigo-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Buscador y Filtros (Diseño del segundo código con filtro de estado del primero) */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por título, tipo o estado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Filtros de estado del primer código */}
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "ALL", label: "Todas" },
                  { key: "PUBLISHED", label: "Publicadas" },
                  { key: "SCHEDULED", label: "Programadas" },
                  { key: "DRAFT", label: "Borradores" },
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setSelectedStatus(filter.key)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition duration-300 ${
                      (selectedStatus || "").toString().toUpperCase() ===
                      filter.key
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* Contador de resultados (diseño del segundo código) */}
              <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                {filteredPublications.length} resultado
                {filteredPublications.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Publicaciones (Diseño del segundo código) */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {filteredPublications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
            <Plus className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">
              {searchTerm
                ? "No se encontraron publicaciones con esa búsqueda"
                : "Este cliente aún no tiene publicaciones"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              {searchTerm
                ? "Intenta con otro término"
                : "¡Crea la primera publicación para comenzar!"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPublications.map((pub) => {
              // Uso de la lógica de media del segundo código
              const firstMedia = pub.media?.[0];
              const finalUrl = getMediaUrl(firstMedia?.url, UPLOADS_BASE_URL);

              // Determinar la clase de estilo por estado (adaptado del segundo código)
              const pubStatusUpper = (pub.status || "")
                .toString()
                .toUpperCase();
              const statusClass =
                pubStatusUpper === "PUBLISHED"
                  ? "bg-green-50 border-green-500 dark:bg-green-900/20"
                  : pubStatusUpper === "DRAFT"
                  ? "bg-yellow-50 border-yellow-500 dark:bg-yellow-900/20"
                  : "bg-gray-50 border-gray-400 dark:bg-gray-800";

              return (
                <div
                  key={pub.id}
                  className={`group rounded-xl p-5 border-l-4 transition-all duration-300 shadow-sm hover:shadow-lg ${statusClass}`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {pub.title || "Sin título"}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 break-all">
                        {finalUrl ? (
                          <a
                            href={finalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                            title="Haz clic para abrir la URL en una nueva pestaña"
                          >
                            🔗 {finalUrl}
                          </a>
                        ) : (
                          <span className="text-red-500 dark:text-red-400">
                            ❌ Sin multimedia
                          </span>
                        )}
                      </p>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Tipo de Contenido */}
                        {pub.content_type && (
                          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100">
                            {pub.content_type}
                          </span>
                        )}
                        {/* Estado */}
                        {pub.status &&
                          (() => {
                            const upper = (pub.status || "")
                              .toString()
                              .toUpperCase();
                            const display =
                              upper === "PUBLISHED"
                                ? "Publicada"
                                : upper === "DRAFT"
                                ? "Borrador"
                                : upper === "SCHEDULED"
                                ? "Programada"
                                : pub.status;
                            const badgeClass =
                              upper === "PUBLISHED"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                : upper === "DRAFT"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                                : "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100";

                            return (
                              <span
                                className={`text-xs font-semibold px-3 py-1 rounded-full ${badgeClass}`}
                              >
                                {display}
                              </span>
                            );
                          })()}
                        {/* Fecha de Creación (del primer código) */}
                        {pub.createdAt && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 ml-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(pub.createdAt).toLocaleDateString(
                              "es-ES"
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Acciones (Diseño del segundo código) */}
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleOpenCommentsModal(pub)}
                        className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition"
                        title="Ver/Añadir Comentarios"
                      >
                        <MessageSquare className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleOpenMediaModal(pub)}
                        className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition"
                        title="Subir/Cambiar Media"
                      >
                        <Image className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(pub)}
                        className="p-2 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
                        title="Editar"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleOpenConfirmDelete(pub)}
                        className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition"
                        title="Eliminar"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modales (Utilizando los componentes del primer código, con estados del segundo) */}
      <PublicationForm
        selectedPublication={publicationToEdit}
        clientId={clientId}
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSave={handleSavePublication}
        isLoading={isSubmitting}
      />

      <MediaModal
        publication={selectedPublicationForMedia}
        publicationId={selectedPublicationForMedia?.id}
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onUploaded={() => fetchPublications()} // Refrescar publicaciones tras subir media
      />

      {/* Confirmation modal real */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setPublicationToEdit(null);
        }}
        onConfirm={(id) => confirmDelete(id)}
        user={publicationToEdit}
        title={`Eliminar publicación`}
        message={`¿Seguro que deseas eliminar "${
          publicationToEdit?.title || "Sin título"
        }"? Esta acción no se puede deshacer.`}
      />

      {/* PublicationCommentsModal real */}
      <PublicationCommentsModal
        isOpen={isCommentsModalOpen}
        onClose={() => setIsCommentsModalOpen(false)}
        publication={selectedPublicationForMedia}
      />
    </div>
  );
};

export default ClientPublicationsPage;
