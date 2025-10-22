import toast from "react-hot-toast";

// Pequeño wrapper para centralizar mensajes de toast y facilitar cambios
export const success = (message, opts = {}) => toast.success(message, opts);
export const error = (message, opts = {}) => toast.error(message, opts);
export const info = (message, opts = {}) => toast(message, opts);

export const promise = (p, messages, opts = {}) =>
  toast.promise(p, messages, opts);

export default { success, error, info, promise };
