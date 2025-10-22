// frontend/src/utils/authUtils.js (Nueva función)
import { jwtDecode } from "jwt-decode"; // Necesitas npm install jwt-decode

export const decodeToken = (token) => {
  if (!token) return null;
  try {
    const payload = jwtDecode(token);

    // 🛑 Verificación de expiración
    if (payload.exp * 1000 < Date.now()) {
      // Token expirado
      localStorage.removeItem("token");
      return null;
    }

    // 🛑 Retorna solo la información relevante
    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      clientId: payload.clientId,
      companyName: payload.companyName,
      plan: payload.plan,
    };
  } catch (error) {
    console.error("Error al decodificar el token:", error);
    localStorage.removeItem("token");
    return null;
  }
};
