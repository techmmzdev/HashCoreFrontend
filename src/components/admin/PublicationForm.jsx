import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { X, Calendar, Edit, Plus, Info } from "lucide-react";

const CONTENT_TYPES = ["POST", "REEL"];
const PUBLICATION_STATUSES = ["DRAFT", "SCHEDULED", "PUBLISHED", "CANCELED"];
const emptyForm = {
  title: "",
  content_type: "",
  status: "DRAFT",
  publish_date: "",
};

const PublicationForm = ({
  selectedPublication,
  clientId,
  isOpen,
  onClose,
  onSave,
  isLoading,
}) => {
  const isEditing = !!selectedPublication;
  const [formData, setFormData] = useState(emptyForm);
  const [validationErrors, setValidationErrors] = useState({});

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    // produce yyyy-MM-ddTHH:mm
    const parts = new Intl.DateTimeFormat("sv-SE", {
      timeZone: "America/Lima",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
      .format(date)
      .replace(" ", "T")
      .slice(0, 16);
    return parts;
  };

  useEffect(() => {
    if (selectedPublication) {
      const formattedDate = formatDateForInput(
        selectedPublication.publish_date
      );
      setFormData({
        title: selectedPublication.title || "",
        content_type: selectedPublication.content_type || "POST",
        status: selectedPublication.status || "DRAFT",
        publish_date: formattedDate,
      });
    } else {
      setFormData(emptyForm);
    }
  }, [selectedPublication, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
    setValidationErrors((s) => ({ ...s, [name]: null }));
  };

  const isFormValid = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = "El título es obligatorio.";
    if (!formData.content_type)
      errors.content_type = "Debe seleccionar un tipo de contenido.";
    if (!formData.publish_date)
      errors.publish_date = "La fecha de publicación es obligatoria.";
    if (formData.publish_date) {
      const selectedDate = new Date(formData.publish_date);
      const now = new Date();
      if (isNaN(selectedDate.getTime()))
        errors.publish_date = "La fecha y hora no son válidas.";
      else if (formData.status === "SCHEDULED" && selectedDate <= now)
        errors.publish_date = "La fecha y hora programada debe ser futura.";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid()) return;
    const dataToSend = {
      ...formData,
      publish_date: new Date(formData.publish_date),
    };
    if (isEditing) dataToSend.id = selectedPublication.id;
    if (onSave) onSave(dataToSend);
  };

  const inputClassNames =
    "mt-1 block w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all dark:bg-gray-700 dark:text-gray-100";
  const selectClassNames =
    "mt-1 block w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all dark:bg-gray-700 dark:text-gray-100 appearance-none";
  const getBorderClass = (fieldName) =>
    validationErrors[fieldName]
      ? "border-red-500 focus:ring-red-500 dark:border-red-500"
      : "border-gray-300 focus:ring-indigo-500 dark:border-gray-600";

  return (
    <Dialog
      open={isOpen}
      onClose={() => {}}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div className="flex items-center justify-center min-h-screen p-4">
        <Dialog.Panel className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-gray-800 dark:text-gray-100 flex flex-col max-h-[90vh] overflow-hidden">
          <button
            onClick={!isLoading ? onClose : undefined}
            aria-label="Cerrar modal"
            className="absolute right-4 top-4 z-20 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <Dialog.Title className="text-2xl font-bold">
              {isEditing ? "Editar Publicación" : "Crear Nueva Publicación"}
            </Dialog.Title>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Cliente ID: {clientId}
            </p>
          </div>

          {isLoading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600"></div>
            </div>
          )}

          <form
            id="publicationForm"
            onSubmit={handleSubmit}
            className="px-6 py-4 space-y-6 overflow-y-auto"
          >
            <div>
              <label className="block text-sm font-medium">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Título de la publicación"
                className={`${inputClassNames} ${getBorderClass("title")}`}
              />
              {validationErrors.title && (
                <p className="mt-1 text-xs text-red-500">
                  {validationErrors.title}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">
                  Tipo de Contenido <span className="text-red-500">*</span>
                </label>
                <select
                  name="content_type"
                  value={formData.content_type}
                  onChange={handleChange}
                  className={`${selectClassNames} ${getBorderClass(
                    "content_type"
                  )}`}
                >
                  <option value="" disabled hidden>
                    Seleccione un Tipo
                  </option>
                  {CONTENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {validationErrors.content_type && (
                  <p className="mt-1 text-xs text-red-500">
                    {validationErrors.content_type}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium">Estado</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={`${selectClassNames} ${getBorderClass("status")}`}
                >
                  {PUBLICATION_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0) + status.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium">
                <Calendar className="inline h-4 w-4 mr-1 mb-0.5 text-indigo-600 dark:text-indigo-400" />
                Fecha y Hora de Publicación
                <span className="text-red-500">*</span>
              </label>
              <input
                name="publish_date"
                type="datetime-local"
                value={formData.publish_date}
                onChange={handleChange}
                className={`${inputClassNames} ${getBorderClass(
                  "publish_date"
                )}`}
              />
              {validationErrors.publish_date && (
                <p className="mt-1 text-xs text-red-500">
                  {validationErrors.publish_date}
                </p>
              )}
            </div>

            <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300 p-3 border border-dashed rounded-lg bg-gray-50 dark:bg-gray-900/40">
              <Info className="h-5 w-5 mt-0.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <p>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  Nota:
                </span>
                los campos marcados con <span className="text-red-500">*</span>
                son obligatorios para crear la publicación.
              </p>
            </div>
          </form>

          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-end gap-3">
            <button
              type="button"
              onClick={!isLoading ? onClose : undefined}
              disabled={isLoading}
              className="rounded-lg px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              form="publicationForm"
              type="submit"
              disabled={isLoading}
              className="rounded-lg px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 transition-all hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:bg-gray-400 disabled:text-gray-800 disabled:shadow-none disabled:transform-none disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-1">
                {isEditing ? (
                  <Edit className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {isEditing ? "Guardar cambios" : "Crear Publicación"}
              </div>
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default PublicationForm;
