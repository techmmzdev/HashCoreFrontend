// src/components/admin/MediaModal.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  X,
  Trash2,
  Image as ImageIcon,
  UploadCloud,
  CheckCircle,
  InfoIcon,
  AlertTriangle,
} from "lucide-react";
import toast from "@/utils/toast";
import { mediaAPI } from "@/api/media";
import ConfirmationModal from "@/components/common/ConfirmationModal";

// === 🌀 Indicador de carga ===
const Loading = ({ message = "Cargando..." }) => (
  <div className="flex items-center justify-center py-4 text-slate-400">
    <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mr-2" />
    <p className="text-sm">{message}</p>
  </div>
);

// === 🖼️ Previsualización de archivo multimedia ===
const MediaItemPreview = ({ media, handleDelete }) => {
  const isVideo = media.media_type.startsWith("video");
  const UPLOADS_BASE_URL = import.meta.env.VITE_UPLOADS_URL || "";
  const mediaUrl = media.url
    ? `${UPLOADS_BASE_URL.replace(/\/$/, "")}/${media.url.replace(/^\//, "")}`
    : null;

  const aspectStyle = isVideo
    ? { aspectRatio: "9 / 16" }
    : { aspectRatio: "1 / 1" };

  return (
    <div className="relative group rounded-lg overflow-hidden border border-slate-600 hover:border-indigo-500 transition shadow-md bg-black">
      <div
        className="w-full max-w-[120px] sm:max-w-[140px] mx-auto rounded-md overflow-hidden"
        style={aspectStyle}
      >
        {isVideo ? (
          <video
            src={mediaUrl}
            controls
            className="object-cover w-full h-full"
            playsInline
          />
        ) : (
          <img
            src={mediaUrl}
            alt="media"
            className="object-cover w-full h-full"
          />
        )}
      </div>

      <button
        onClick={() => handleDelete(media.id)}
        className="absolute top-1 right-1 bg-red-600/90 hover:bg-red-700 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"
        title="Eliminar archivo"
      >
        <Trash2 className="w-3 h-3" />
      </button>

      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1 truncate">
        {media.url.split("/").pop()}
      </div>
    </div>
  );
};

// === 📦 Modal de gestión de material multimedia ===
const MediaModal = ({
  publicationId,
  publication,
  isOpen,
  onClose,
  onUploaded,
}) => {
  const [mediaList, setMediaList] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [publishNow, setPublishNow] = useState(false);
  const [typeMismatch, setTypeMismatch] = useState(false);
  const fileInputRef = useRef(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState(null);

  // 🧹 Limpiar estado al cerrar modal
  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setTypeMismatch(false);
      setPublishNow(false);
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = null;
    }
  }, [isOpen]);

  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "video/mp4",
    "video/webm",
  ];

  // 📥 Cargar material multimedia
  const fetchMedia = useCallback(async () => {
    if (!publicationId) return;
    try {
      setLoading(true);
      const data = await mediaAPI.getMedia(publicationId);
      setMediaList(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar material multimedia.");
    } finally {
      setLoading(false);
    }
  }, [publicationId]);

  useEffect(() => {
    if (isOpen && publicationId) fetchMedia();
  }, [isOpen, publicationId, fetchMedia]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // 📂 Manejo del archivo seleccionado
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && !allowedTypes.includes(file.type)) {
      toast.error(
        "Tipo de archivo no válido. Solo se permiten imágenes o videos (mp4/webm)."
      );
      setSelectedFile(null);
      e.target.value = null;
      return;
    }

    if (publication?.content_type) {
      const pubType = publication.content_type.toUpperCase();
      const isVideo = file.type.startsWith("video");
      const isImage = file.type.startsWith("image");

      if (pubType === "REEL" && !isVideo) {
        toast.error("Esta publicación es un REEL — sube un video.");
        setTypeMismatch(true);
        e.target.value = null;
        return;
      }
      if (pubType === "POST" && !isImage) {
        toast.error("Esta publicación es un POST — sube una imagen.");
        setTypeMismatch(true);
        e.target.value = null;
        return;
      }
      setTypeMismatch(false);
    }

    setSelectedFile(file);
  };

  // 🚀 Subir archivo
  const handleUpload = async () => {
    if (!selectedFile) return toast.error("Selecciona un archivo primero.");

    const formData = new FormData();
    formData.append("mediaFile", selectedFile);

    try {
      setLoading(true);
      const uploadPromise = mediaAPI.uploadMedia(
        publicationId,
        formData,
        publishNow
      );

      await toast.promise(uploadPromise, {
        loading: "Subiendo archivo...",
        success: (res) => res?.message || "Archivo subido correctamente. 🎉",
        error: (err) =>
          err?.response?.data?.message || "Error al subir el archivo.",
      });

      // Cerrar el modal después de una subida exitosa
      onClose?.();

      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = null;
      await fetchMedia();
      onUploaded?.();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ Eliminar archivo
  const handleDelete = (mediaId) => {
    setMediaToDelete({ id: mediaId });
    setIsConfirmOpen(true);
  };

  const confirmDelete = async (id) => {
    if (!id) {
      setIsConfirmOpen(false);
      setMediaToDelete(null);
      return;
    }

    try {
      setLoading(true);
      await toast.promise(mediaAPI.deleteMedia(publicationId, id), {
        loading: "Eliminando archivo...",
        success: (res) =>
          res?.reverted || res?.publication
            ? "Archivo eliminado. La publicación se ha revertido a borrador."
            : "Archivo eliminado correctamente. 🗑️",
        error: (err) =>
          err?.response?.data?.message || "Error al eliminar el archivo.",
      });

      setIsConfirmOpen(false);
      setMediaToDelete(null);
      await fetchMedia();
      onUploaded?.();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isUploading = loading && selectedFile;
  const isFetchingMedia = loading && !selectedFile;
  const contentType = publication?.content_type
    ? publication.content_type.toUpperCase()
    : "";

  // 💡 Mensaje dinámico según el tipo de publicación
  const allowedFormatsMessage =
    contentType === "POST" ? (
      <>
        Solo se permiten <strong>imágenes (PNG, JPG, WEBP)</strong> para un{" "}
        {contentType}. Un archivo por publicación.
      </>
    ) : contentType === "REEL" ? (
      <>
        Solo se permiten <strong>videos (MP4, WEBM)</strong> para un{" "}
        {contentType}. Un archivo por publicación.
      </>
    ) : (
      <>
        Permitidos: <strong>imágenes (PNG, JPG, WEBP)</strong> o{" "}
        <strong>videos (MP4, WEBM)</strong>. Un archivo por publicación.
      </>
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-3 py-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-sm sm:max-w-md overflow-hidden animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* === Header === */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-700 sticky top-0 bg-slate-800">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-indigo-400 shrink-0" />
            <span>Multimedia</span>
            {contentType && (
              <span className="text-xs font-semibold text-indigo-400 border border-indigo-500 rounded-full px-1.5 py-0.5">
                {contentType}
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1 rounded-full hover:bg-slate-700 shrink-0"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* === Body === */}
        <div className="p-4 space-y-4">
          {/* --- Subida --- */}
          <div className="space-y-3">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="media-upload-input"
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition-all cursor-pointer shadow-md text-sm ${
                  mediaList.length > 0
                    ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed opacity-70"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg"
                }`}
              >
                <UploadCloud className="w-4 h-4 shrink-0" />
                <span className="truncate flex-1 text-left">
                  {selectedFile ? selectedFile.name : "Seleccionar archivo"}
                </span>
                <input
                  id="media-upload-input"
                  type="file"
                  ref={fileInputRef}
                  accept="image/*,video/mp4,video/webm"
                  onChange={handleFileChange}
                  disabled={mediaList.length > 0 || isUploading}
                  className="hidden"
                />
              </label>

              <div className="flex gap-2 items-center">
                <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={publishNow}
                    onChange={(e) => setPublishNow(e.target.checked)}
                    className="accent-indigo-500 w-4 h-4 shrink-0"
                    disabled={mediaList.length > 0 || isUploading}
                  />
                  <span className="text-xs text-slate-300 whitespace-nowrap truncate">
                    Publicar ahora
                  </span>
                </label>

                <button
                  onClick={handleUpload}
                  disabled={
                    !selectedFile ||
                    isUploading ||
                    mediaList.length > 0 ||
                    typeMismatch
                  }
                  className={`px-4 py-2 rounded-lg font-medium transition-all shadow-md text-sm shrink-0 flex items-center gap-1 ${
                    !selectedFile ||
                    isUploading ||
                    mediaList.length > 0 ||
                    typeMismatch
                      ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700 hover:shadow-lg"
                  }`}
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="hidden sm:inline">Subiendo</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Subir</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {typeMismatch && (
              <p className="text-xs text-yellow-300 flex items-start gap-1.5 bg-yellow-900/20 border border-yellow-800 rounded px-2 py-1.5">
                <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5 text-yellow-300" />
                <span>
                  El archivo no coincide con el tipo de publicación (
                  {contentType})
                </span>
              </p>
            )}

            {mediaList.length === 0 && (
              <p className="text-xs text-gray-400 flex items-start gap-1.5 bg-indigo-900/20 border border-indigo-800 rounded px-2 py-1.5">
                <InfoIcon className="w-3 h-3 shrink-0 mt-0.5 text-indigo-400" />
                <span>{allowedFormatsMessage}</span>
              </p>
            )}

            {mediaList.length > 0 && (
              <div className="flex items-start gap-2 bg-indigo-900/20 border border-indigo-800 text-indigo-200 px-3 py-2 rounded text-xs">
                <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                <p>Ya existe un archivo. Elimínalo para subir uno nuevo.</p>
              </div>
            )}
          </div>

          <div className="border-t border-slate-700" />

          {/* --- Lista de media --- */}
          {isFetchingMedia ? (
            <Loading message="Cargando multimedia..." />
          ) : mediaList.length === 0 ? (
            <div className="text-slate-500 text-center py-6 flex flex-col items-center justify-center">
              <ImageIcon className="w-8 h-8 mb-1.5 text-slate-600" />
              <p className="text-sm">No hay material aún.</p>
            </div>
          ) : (
            <div className="flex justify-center">
              <div>
                {mediaList.map((m) => (
                  <div key={m.id}>
                    <MediaItemPreview media={m} handleDelete={handleDelete} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setMediaToDelete(null);
        }}
        onConfirm={() => mediaToDelete && confirmDelete(mediaToDelete.id)}
        user={mediaToDelete}
        title="Eliminar archivo"
        message="¿Seguro que deseas eliminar este archivo? Esta acción no se puede deshacer."
      />
    </div>
  );
};

export default MediaModal;
