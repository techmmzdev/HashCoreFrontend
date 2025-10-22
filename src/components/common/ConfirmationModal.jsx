import React, { useEffect, useRef } from "react";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  user,
  title,
  message,
}) => {
  const modalRef = useRef(null);
  const firstFocusableElementRef = useRef(null);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    const handleTab = (event) => {
      if (event.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements.length) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("keydown", handleTab);
      if (firstFocusableElementRef.current) {
        firstFocusableElementRef.current.focus();
      }
      document.body.style.overflow = "hidden"; // 🟢 Bloquea el scroll
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("keydown", handleTab);
      document.body.style.overflow = "auto"; // 🔵 Restaura el scroll
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalTitle = title || "Confirmar acción";
  const modalMessage =
    message ||
    `¿Estás seguro de que deseas eliminar ${
      user?.name || user?.email || "este elemento"
    }? Esta acción no se puede deshacer.`;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ease-in-out"
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 transform transition-all duration-300 ease-in-out scale-100"
        onClick={(e) => e.stopPropagation()}
        role="document"
        aria-labelledby="modal-title"
      >
        <h2
          id="modal-title"
          className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4"
        >
          {modalTitle}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {modalMessage}
        </p>
        <div className="flex justify-end space-x-3">
          <button
            ref={firstFocusableElementRef}
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm(user?.id);
              onClose();
            }}
            className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
