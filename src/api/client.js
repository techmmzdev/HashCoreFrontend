import api from "./axios";
import { createNewUser, updateUser, deleteUser } from "./user";

export const getAllClients = async () => {
  // Ruta: GET /api/clients
  const response = await api.get("/clients");
  return response.data;
};

export const getMyClientInfo = async () => {
  // Ruta: GET /api/clients/me
  const response = await api.get("/clients/me");
  return response.data;
};

export const getClientById = async (clientId) => {
  // Ruta: GET /api/clients/:clientId
  const response = await api.get(`/clients/${clientId}`);
  return response.data;
};

export const createClient = async (payload) => {
  // Llama a POST /users
  return createNewUser({
    ...payload,
    role: "CLIENTE",
  });
};

export const updateClient = async (userId, payload) => {
  // Llama a PUT /users/:userId
  return updateUser(userId, payload);
};

// 🧨 Eliminar cliente (usa endpoint de users)
export const deleteClient = async (userId) => {
  // Internamente llama al endpoint DELETE /users/:userId
  return deleteUser(userId);
};
