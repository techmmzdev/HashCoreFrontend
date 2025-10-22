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

// Puedes añadir aquí funciones para actualizar, eliminar o buscar usuarios si son necesarias.
