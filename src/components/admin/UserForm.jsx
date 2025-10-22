/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import { X, User, Lock, Mail, Building2, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PLAN_OPTIONS = [
  { value: "BASIC", label: "Básico" },
  { value: "STANDARD", label: "Estándar" },
  { value: "FULL", label: "Premium" },
];

const UserForm = ({
  isOpen,
  onClose,
  initialUser,
  onSubmit,
  isLoading,
  error,
  mode = "client",
}) => {
  const isEditing = !!initialUser;
  const isClientMode = mode === "client";
  const defaultRole = isClientMode ? "CLIENTE" : "ADMIN";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: defaultRole,
    company_name: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    status: true,
    plan: "BASIC",
  });

  const handleKeyDown = useCallback(
    (e) => e.key === "Escape" && onClose(),
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      const client = initialUser?.clients?.[0] || {};
      setFormData({
        name: initialUser?.name || "",
        email: initialUser?.email || "",
        password: "",
        role: initialUser?.role || defaultRole,
        company_name: client.company_name || "",
        contact_name: client.contact_name || initialUser?.name || "",
        contact_email: client.contact_email || initialUser?.email || "",
        contact_phone: client.contact_phone || "",
        status: client.status ?? true,
        plan: client.plan || "BASIC",
      });
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, initialUser, mode, defaultRole, handleKeyDown]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: isClientMode ? formData.role : "ADMIN",
    };

    if (isClientMode) {
      Object.assign(payload, {
        company_name: formData.company_name,
        contact_name: formData.contact_name,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
        status: formData.status,
        plan: formData.plan,
      });
    }

    if (isEditing && !payload.password) delete payload.password;
    onSubmit(isEditing ? initialUser.id : null, payload);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          // onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800">
                {isEditing ? "Editar" : "Crear"}{" "}
                {isClientMode ? "Cliente" : "Administrador"}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <form
              onSubmit={handleSubmit}
              className="p-5 space-y-6 overflow-y-auto max-h-[75vh]"
            >
              {error && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Datos de Acceso
                </h3>

                <InputField
                  label="Nombre"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  icon={User}
                  required
                />
                <InputField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  icon={Mail}
                  required
                />
                <InputField
                  label={isEditing ? "Contraseña (opcional)" : "Contraseña"}
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  icon={Lock}
                  required={!isEditing}
                />
                <p className="text-sm text-gray-600">
                  Rol: <span className="font-medium">{defaultRole}</span>
                </p>
              </section>

              {isClientMode && (
                <section className="space-y-3 border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Datos de Cliente
                  </h3>
                  <InputField
                    label="Empresa"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    icon={Building2}
                    required
                  />
                  <InputField
                    label="Nombre de contacto"
                    name="contact_name"
                    value={formData.contact_name}
                    onChange={handleChange}
                    icon={User}
                    required
                  />
                  <InputField
                    label="Teléfono"
                    name="contact_phone"
                    type="tel"
                    value={formData.contact_phone}
                    onChange={handleChange}
                    icon={Phone}
                  />

                  <label className="block text-sm text-gray-700">
                    Plan:
                    <select
                      name="plan"
                      value={formData.plan}
                      onChange={handleChange}
                      className="mt-1 w-full border-gray-300 rounded-lg p-2.5 text-gray-800 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                    >
                      {PLAN_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      name="status"
                      checked={formData.status}
                      onChange={handleChange}
                      className="w-4 h-4 accent-indigo-500"
                    />
                    <span>{formData.status ? "Activo" : "Inactivo"}</span>
                  </label>
                </section>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {isLoading
                    ? "Guardando..."
                    : isEditing
                    ? "Guardar Cambios"
                    : "Crear"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Input Reusable ---
const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  required,
  icon: Icon,
  placeholder,
}) => (
  <div>
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="w-5 h-5 text-gray-400" />
        </div>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition"
      />
    </div>
  </div>
);

export default UserForm;
