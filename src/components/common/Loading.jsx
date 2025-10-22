// frontend/src/components/Loading.jsx
import React from "react";
import { Loader2 } from "lucide-react";

const Loading = ({
  message = "Cargando...",
  fullScreen = false,
  overlay = false,
}) => {
  const isLogout = message.toLowerCase().includes("cerrando sesión");

  if (fullScreen) {
    return (
      <div
        className={`fixed inset-0 z-999 flex items-center justify-center p-4
          ${isLogout ? "bg-gray-900" : "bg-black/30 backdrop-blur-sm"}
        `}
      >
        <div
          className={`${
            isLogout ? "bg-gray-900" : "bg-white dark:bg-gray-800"
          } rounded-2xl shadow-lg p-8 max-w-md w-full text-center`}
        >
          <Loader2
            className={`w-12 h-12 animate-spin ${
              isLogout ? "text-white" : "text-blue-600 dark:text-blue-400"
            } mx-auto mb-4`}
          />
          <h2
            className={`text-2xl font-semibold mb-2 ${
              isLogout ? "text-white" : "text-gray-800 dark:text-gray-100"
            }`}
          >
            {message}
          </h2>
          <p
            className={`${
              isLogout ? "text-gray-300" : "text-gray-600 dark:text-gray-400"
            }`}
          >
            Por favor, espera un momento...
          </p>
        </div>
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 z-60 flex items-center justify-center rounded-lg bg-white/70 dark:bg-gray-800/70">
        <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
          <Loader2 className="w-10 h-10 animate-spin" />
          <span className="font-medium">{message}</span>
        </div>
      </div>
    );
  }

  // Inline small loader
  return (
    <div className="inline-flex items-center gap-2">
      <Loader2 className="w-5 h-5 animate-spin text-indigo-600 dark:text-indigo-400" />
      <span className="text-sm text-gray-600 dark:text-gray-300">
        {message}
      </span>
    </div>
  );
};

export default Loading;
