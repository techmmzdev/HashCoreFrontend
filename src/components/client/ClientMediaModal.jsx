/* eslint-disable no-unused-vars */
import { X, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

const ClientMediaModal = ({ isOpen, onClose, publication }) => {
  // Añadir/retirar listener mientras el modal esté abierto.
  // Definimos el handler dentro del efecto para evitar dependencias adicionales
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" || e.key === "Esc") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !publication) return null;

  const media = publication.media?.[0];
  const UPLOADS_BASE_URL = import.meta.env.VITE_UPLOADS_URL || "";
  const mediaUrl = media
    ? `${UPLOADS_BASE_URL.replace(/\/$/, "")}/${media.url.replace(/^\//, "")}`
    : null;

  const isVideo = media?.url?.match(/\.(mp4|mov|webm)$/i);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          //   onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-3xl rounded-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden flex flex-col items-center"
          >
            {/* Botón de cierre */}
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/30 dark:bg-gray-800/40 text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="w-full px-5 pt-5 text-center border-b border-gray-200 dark:border-gray-700 pb-3">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
                {publication.title || "Vista de publicación"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {publication.content_type === "REEL" ? (
                  <span className="flex items-center justify-center gap-1">
                    <Play className="w-3 h-3" /> Video (Reel)
                  </span>
                ) : (
                  "Imagen (Post)"
                )}
              </p>
            </div>

            {/* Contenido multimedia */}
            <div className="w-full flex-1 flex items-center justify-center bg-gray-900 dark:bg-black p-4">
              {mediaUrl ? (
                isVideo ? (
                  <video
                    src={mediaUrl}
                    controls
                    className="max-h-[75vh] max-w-full rounded-xl shadow-lg object-contain"
                    autoPlay
                    muted
                  />
                ) : (
                  <img
                    src={mediaUrl}
                    alt={media?.name || "media"}
                    className="max-h-[75vh] max-w-full rounded-xl shadow-lg object-contain"
                  />
                )
              ) : (
                <div className="text-center text-gray-400">
                  <svg
                    className="w-16 h-16 mx-auto mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-sm">
                    Esta publicación no tiene contenido multimedia.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ClientMediaModal;
