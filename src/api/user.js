import api from "./axios";

export const loginUser = async (email, password) => {
  const response = await api.post("/users/login", { email, password });
  // El AuthContext es el encargado de guardar el token
  return response.data;
};

export const createNewUser = async (userData) => {
  // Solo los ADMIN pueden acceder a esta ruta /api/users (protegida por el backend)
  const response = await api.post("/users", userData);
  return response.data;
};

export const getAllUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};

// 🔑 NUEVA FUNCIÓN: Para actualizar un usuario (y su cliente asociado)
export const updateUser = async (userId, userData) => {
  const response = await api.put(`/users/${userId}`, userData);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
};
