import api from "./axios";

export const getAllPublications = async () => {
  // Ruta: GET /api/publications (Requiere ADMIN, devuelve todo)
  const response = await api.get("/publications");
  return response.data;
};

export const getPublicationsByClient = async (clientId) => {
  // Ruta: GET /api/clients/:clientId/publications
  const response = await api.get(`/clients/${clientId}/publications`);
  return response.data;
};

export const createPublication = async (clientId, publicationData) => {
  // Ruta: POST /api/clients/:clientId/publications
  const response = await api.post(
    `/clients/${clientId}/publications`,
    publicationData
  );
  return response.data;
};

export const updatePublication = async (publicationId, updateData) => {
  // Ruta: PUT /api/publications/:publicationId
  const response = await api.put(`/publications/${publicationId}`, updateData);
  return response.data;
};

export const deletePublication = async (publicationId) => {
  // Ruta: DELETE /api/publications/:publicationId
  const response = await api.delete(`/publications/${publicationId}`);
  return response.data;
};

// ADMIN: Obtener todas las publicaciones (usa /api/publications/admin en backend)
export const getAdminPublications = async () => {
  const response = await api.get(`/publications/admin`);
  return response.data;
};

// ADMIN: actualizar solo el estado de una publicación
export const updatePublicationStatus = async (publicationId, status) => {
  const response = await api.patch(`/publications/${publicationId}/status`, {
    status,
  });
  return response.data;
};
