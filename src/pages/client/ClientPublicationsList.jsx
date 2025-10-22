/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import * as publicationAPI from "@/api/publication";
import api from "@/api/axios";
import { useAuth } from "@/contexts/AuthContext";
import {
  FileText,
  Calendar,
  Download,
  Filter,
  MessageCircle,
  Image,
  TrendingUp,
} from "lucide-react";
import Loading from "@/components/common/Loading";
import PublicationCommentsModal from "@/components/admin/PublicationCommentsModal";
import PublicationMediaModal from "@/components/client/ClientMediaModal";
import { motion, AnimatePresence } from "framer-motion";

const ClientPublicationsList = () => {
  const { user } = useAuth();
  const [publications, setPublications] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [selectedPub, setSelectedPub] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);

  // evita scroll si esta abierto un modal
  useEffect(() => {
    if (selectedPub || selectedMedia) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [selectedPub, selectedMedia]);

  const fetchPublications = async () => {
    try {
      setLoading(true);
      const data = await publicationAPI.getPublicationsByClient(user.clientId);
      setPublications(data);
      setFiltered(data);
    } catch (err) {
      console.error("Error al cargar publicaciones:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (type) => {
    setFilter(type);
    setFiltered(
      type === "ALL"
        ? publications
        : publications.filter((p) => p.content_type === type)
    );
  };

  const handleDownload = async (pub) => {
    const file = pub.media?.[0];
    if (!file?.url) return;
    try {
      const base = import.meta.env.VITE_UPLOADS_URL || "";
      const fileUrl = `${base.replace(/\/$/, "")}/${file.url.replace(
        /^\//,
        ""
      )}`;
      const resp = await api.get(fileUrl, { responseType: "blob" });
      const blob = new Blob([resp.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.url.split("/").pop();
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error al descargar archivo:", err);
    }
  };

  useEffect(() => {
    if (user?.clientId) fetchPublications();
  }, [user]);

  if (loading)
    return <Loading fullScreen message="Cargando publicaciones..." />;

  const getStatusConfig = (status) => {
    const map = {
      PUBLISHED: {
        bg: "bg-green-50 dark:bg-green-900/20",
        badge:
          "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200",
        dot: "bg-green-500",
      },
      SCHEDULED: {
        bg: "bg-amber-50 dark:bg-amber-900/20",
        badge:
          "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-200",
        dot: "bg-amber-500",
      },
      DRAFT: {
        bg: "bg-gray-50 dark:bg-gray-800/40",
        badge: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200",
        dot: "bg-gray-500",
      },
    };
    return map[status] || map.DRAFT;
  };

  return (
    <div className="min-h-0 bg-linear-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 md:p-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-4"
      >
        <div>
          <h2 className="text-3xl md:text-4xl font-bold bg-linear-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Mis Publicaciones
          </h2>
          <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mt-1">
            <TrendingUp className="w-4 h-4" />
            {filtered.length} publicación{filtered.length !== 1 && "es"}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          {["ALL", "REEL", "POST"].map((type) => (
            <motion.button
              key={type}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleFilterChange(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                filter === type
                  ? "bg-linear-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                  : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-600"
              }`}
            >
              {type === "ALL" ? "Todos" : type}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <FileText className="w-14 h-14 text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">
            No hay publicaciones
          </h3>
          <p className="text-gray-400 dark:text-gray-500 mt-1 text-center">
            {filter === "ALL"
              ? "Crea tu primera publicación para verla aquí."
              : `No hay publicaciones de tipo ${filter}.`}
          </p>
        </motion.div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          <AnimatePresence>
            {filtered.map((pub, i) => (
              <motion.div
                key={pub.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className={`rounded-2xl overflow-hidden border shadow-sm hover:shadow-xl transition-all duration-300 ${
                  getStatusConfig(pub.status).bg
                } border-gray-100 dark:border-gray-700`}
              >
                <div className="p-5 flex flex-col h-full">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-2 items-center">
                      <FileText className="w-5 h-5 text-indigo-500" />
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {pub.title || "Sin título"}
                      </h3>
                    </div>
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        getStatusConfig(pub.status).badge
                      }`}
                    >
                      {pub.status}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          getStatusConfig(pub.status).dot
                        }`}
                      />
                      <span>
                        <strong>Tipo:</strong> {pub.content_type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-500" />
                      <span>
                        {new Date(pub.publish_date).toLocaleDateString(
                          "es-ES",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="grid grid-cols-3 gap-2 mt-5 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <ActionButton
                      icon={MessageCircle}
                      color="indigo"
                      onClick={() => setSelectedPub(pub)}
                    />
                    <ActionButton
                      icon={Image}
                      color="blue"
                      onClick={() => setSelectedMedia(pub)}
                    />
                    <ActionButton
                      icon={Download}
                      color="gray"
                      onClick={() => handleDownload(pub)}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Modales */}
      <PublicationCommentsModal
        isOpen={!!selectedPub}
        onClose={() => setSelectedPub(null)}
        publication={selectedPub}
        readOnly
      />
      <PublicationMediaModal
        isOpen={!!selectedMedia}
        onClose={() => setSelectedMedia(null)}
        publication={selectedMedia}
      />
    </div>
  );
};

// 🔹 Botón de acción reutilizable
const ActionButton = ({ icon: Icon, text, color, onClick }) => {
  const colorMap = {
    indigo:
      "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50",
    blue: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50",
    gray: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600",
  };
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${colorMap[color]}`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="hidden sm:inline">{text}</span>
    </motion.button>
  );
};

export default ClientPublicationsList;
