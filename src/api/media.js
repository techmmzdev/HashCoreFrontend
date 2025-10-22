// frontend/src/api/media.js
import api from "./axios.js";

export const mediaAPI = {
  // === 🖼️ MATERIAL MULTIMEDIA (MEDIA) ===

  // 📤 Subir material multimedia (SOLO ADMIN - RF-009)
  uploadMedia: async (publicationId, mediaFormData, publishNow = false) => {
    const url = `/publications/${publicationId}/media${
      publishNow ? "?publishNow=true" : ""
    }`;
    const response = await api.post(url, mediaFormData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // 📥 Obtener material multimedia de una publicación (RF-012)
  getMedia: async (publicationId) => {
    const response = await api.get(`/publications/${publicationId}/media`);
    return response.data;
  },

  // ❌ Eliminar un material multimedia por ID (SOLO ADMIN)
  deleteMedia: async (publicationId, mediaId) => {
    const response = await api.delete(
      `/publications/${publicationId}/media/${mediaId}`
    );
    return response.data;
  },
};
