// src/pages/admin/PublicationCommentsModal.jsx
import { useState, useEffect } from "react";
import commentsApi from "@/api/comments";
import toast from "@/utils/toast";
import { Send, MessageSquare, Trash2 } from "lucide-react";
import ConfirmationModal from "@/components/common/ConfirmationModal.jsx";

const PublicationCommentsModal = ({
  isOpen,
  onClose,
  publication,
  readOnly = false,
}) => {
  // Determinamos publicationId de forma segura para poder llamar hooks siempre
  const publicationId = publication?.id ?? null;
  const title = publication?.title ?? "Publicación";

  // Estados locales para manejar comentarios sin usar hooks externos
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const [newComment, setNewComment] = useState("");

  const [deletingId, setDeletingId] = useState(null);

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const [commentToDelete, setCommentToDelete] = useState(null);

  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadComments = async () => {
    if (!publicationId) return;
    setIsLoading(true);
    setIsError(false);
    try {
      const data = await commentsApi.fetchComments(publicationId);
      // el servicio devuelve un array de comentarios
      setComments(Array.isArray(data) ? data : data?.comments ?? []);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setIsError(true);
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, publicationId]);

  // Cerrar con la tecla Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isConfirmingDelete) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, isConfirmingDelete]);

  // para bloquear scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Si el modal está cerrado o no hay publicación, renderizamos null pero
  // después de haber llamado a los hooks (cumplir regla de Hooks)
  if (!isOpen || !publication) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsCreating(true);
    try {
      await commentsApi.createComment(publicationId, {
        comment: newComment.trim(),
      });
      setNewComment("");
      await loadComments();
      toast.success("Comentario enviado.");
    } catch (err) {
      console.error("Error al enviar comentario:", err);
      toast.error("No se pudo enviar el comentario.");
    } finally {
      setIsCreating(false);
    }
  };

  const openConfirmModal = (commentId) => {
    const comment = comments.find((c) => c.id === commentId);

    setCommentToDelete(comment);
    setDeletingId(commentId); // Marca el elemento para el spinner
    setIsConfirmingDelete(true); // Muestra el modal
  };

  const handleConfirmDelete = async () => {
    if (!commentToDelete) return; // Seguridad
    setIsDeleting(true);
    try {
      await commentsApi.deleteComment(publicationId, commentToDelete.id);
      await loadComments();
      toast.success("Comentario eliminado.");
    } catch (err) {
      console.error("Error al eliminar el comentario:", err);
      toast.error("No se pudo eliminar el comentario.");
    } finally {
      setIsDeleting(false);
      closeConfirmModal();
    }
  };

  const closeConfirmModal = () => {
    setIsConfirmingDelete(false);
    setDeletingId(null);
    setCommentToDelete(null);
  };

  return (
    <>
      {/* Modal Principal de Comentarios */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh]">
          {/* Encabezado del Modal */}
          <div className="p-4 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <MessageSquare className="h-6 w-6 mr-2 text-indigo-600" />
              Comentarios para: {title || "Publicación"}
            </h2>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              &times;
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Formulario para Nuevo Comentario */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe un comentario..."
                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                disabled={isCreating}
              />
              <button
                type="submit"
                disabled={isCreating || !newComment.trim()}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>

            {/* Lista de Comentarios */}
            <div className="space-y-3 pt-2">
              {isLoading && (
                <p className="text-gray-500 dark:text-gray-400">
                  Cargando comentarios...
                </p>
              )}
              {isError && (
                <p className="text-red-500">Error al cargar los comentarios.</p>
              )}

              {!isLoading && comments.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  Sé el primero en comentar. 🚀
                </p>
              )}

              {comments.map((comment) => {
                const isCurrentDeleting = deletingId === comment.id;
                return (
                  <div
                    key={comment.id}
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm relative"
                  >
                    {/* Nombre del Usuario */}
                    <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                      {comment.user?.name ||
                        (comment.user?.role === "ADMIN"
                          ? "Administrador"
                          : "Usuario Desconocido")}
                    </p>
                    {/* Texto del Comentario */}
                    <p className="text-gray-800 dark:text-gray-200 mt-1">
                      {comment.comment}
                    </p>
                    {/* Fecha */}
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-right">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </p>

                    {!readOnly && (
                      <button
                        onClick={() => openConfirmModal(comment.id)}
                        disabled={isDeleting || isCurrentDeleting}
                        className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700 disabled:opacity-50 transition"
                        title="Eliminar comentario"
                      >
                        {isCurrentDeleting ? (
                          <span className="text-xs">...</span>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 🔴 Tu ConfirmationModal */}
      <ConfirmationModal
        isOpen={isConfirmingDelete}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmDelete}
        user={commentToDelete?.user}
        title="Eliminar Comentario"
        message={`¿Estás seguro de que deseas eliminar este comentario? El texto es: "${commentToDelete?.comment}". Esta acción no se puede deshacer.`}
      />
    </>
  );
};

export default PublicationCommentsModal;
