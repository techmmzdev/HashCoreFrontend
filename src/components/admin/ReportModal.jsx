import React, { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import toast from "@/utils/toast";
import { X, Image as ImageIcon, VideoIcon } from "lucide-react";
import { mediaAPI } from "@/api/media";

/**
 * 🔧 Corrige colores oklch() no soportados por html2canvas
 */
function fixColorsForHtml2Canvas(element) {
  const all = element.querySelectorAll("*");
  all.forEach((el) => {
    const style = window.getComputedStyle(el);
    if (style.backgroundColor?.includes("oklch")) {
      el.style.backgroundColor = "#ffffff";
    }
    if (style.color?.includes("oklch")) {
      el.style.color = "#000000";
    }
    if (style.borderColor?.includes("oklch")) {
      el.style.borderColor = "#e5e7eb";
    }
  });
}

const ReportModal = ({
  open = true,
  onClose = () => {},
  publication = {},
  client = null,
  asPage = false,
}) => {
  const reportRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const [mediaList, setMediaList] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(false);

  const UPLOADS_BASE_URL = import.meta.env.VITE_UPLOADS_URL || "";

  // 🧩 Cargar media asociada
  useEffect(() => {
    if (!open || !publication?.id) return;

    const fetchMedia = async () => {
      try {
        setLoadingMedia(true);
        const data = await mediaAPI.getMedia(publication.id);
        setMediaList(data || []);
      } catch (err) {
        console.error("Error cargando media:", err);
        toast.error("Error al cargar archivos multimedia.");
      } finally {
        setLoadingMedia(false);
      }
    };

    fetchMedia();
  }, [open, publication?.id]);

  useEffect(() => {
    if (!open) return;
    reportRef.current?.scrollIntoView?.({ behavior: "smooth" });
  }, [open]);

  /**
   * 📄 Exportar a PDF
   */
  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setExporting(true);
    try {
      fixColorsForHtml2Canvas(reportRef.current);

      const canvas = await html2canvas(reportRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 40;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight > pageHeight - 40) {
        let y = 20;
        let heightLeft = imgHeight;
        while (heightLeft > 0) {
          pdf.addImage(imgData, "PNG", 20, y, imgWidth, imgHeight);
          heightLeft -= pageHeight;
          if (heightLeft > 0) {
            pdf.addPage();
            y = -heightLeft + 20;
          }
        }
      } else {
        pdf.addImage(imgData, "PNG", 20, 20, imgWidth, imgHeight);
      }

      pdf.save(
        `${(publication?.title || "reporte").replace(/[^a-z0-9_-]/gi, "_")}.pdf`
      );
      toast.success("Reporte exportado correctamente como PDF.");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo generar el PDF.");
    } finally {
      setExporting(false);
    }
  };

  /**
   * 🧱 Contenido del reporte
   */
  const content = (
    <div className="p-6 space-y-5 bg-white text-gray-800 min-h-[300px]">
      {/* 🧾 Header */}
      <div className="flex items-center justify-between border-b pb-2">
        <h2 className="text-xl font-bold text-indigo-700 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-indigo-500" />
          {publication?.title || "Sin título"}
        </h2>
        <span className="text-sm text-gray-500">
          Estado:{" "}
          <span className="font-semibold text-gray-700">
            {publication?.status || "Desconocido"}
          </span>
        </span>
      </div>

      {/* 👤 Datos cliente */}
      <div className="text-sm text-gray-700">
        <p>
          <span className="font-medium">Cliente:</span>{" "}
          {client?.name || publication?.client_id || "N/D"}
        </p>
        <p>
          <span className="font-medium">Fecha creación:</span>{" "}
          {new Date(
            publication?.createdAt || publication?.created_at || Date.now()
          ).toLocaleString()}
        </p>
      </div>

      {/* 📸 Multimedia */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-2">Multimedia</h4>
        {loadingMedia ? (
          <p className="text-sm text-gray-500">Cargando archivos...</p>
        ) : mediaList.length === 0 ? (
          <div className="text-center text-gray-500 py-6 flex flex-col items-center justify-center">
            <VideoIcon className="w-8 h-8 mb-1.5 text-gray-400" />
            <p className="text-sm">No hay multimedia asociada.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {mediaList.map((m, idx) => {
              const isVideo = m.media_type?.startsWith("video");
              const mediaUrl = `${UPLOADS_BASE_URL.replace(
                /\/$/,
                ""
              )}/${m.url.replace(/^\//, "")}`;
              return (
                <div
                  key={idx}
                  className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-100 shadow-sm"
                >
                  {isVideo ? (
                    <video
                      src={mediaUrl}
                      controls
                      className="w-full h-36 object-cover bg-black"
                    />
                  ) : (
                    <img
                      src={mediaUrl}
                      alt={m.name || `media-${idx}`}
                      className="w-full h-36 object-cover"
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 🧾 Detalles */}
      <div className="border-t pt-3">
        <h4 className="font-semibold text-gray-800 mb-2">Detalles</h4>
        <p className="text-sm text-gray-600">
          {publication?.description || "Sin descripción"}
        </p>
      </div>

      {/* 📤 Exportar */}
      <div className="text-right pt-4 border-t">
        <button
          onClick={handleExportPDF}
          disabled={exporting}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
        >
          {exporting ? "Generando..." : "Exportar PDF"}
        </button>
      </div>
    </div>
  );

  // 📄 Modo página completa
  if (asPage) {
    return (
      <div className="max-w-5xl mx-auto py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Reporte de publicación</h1>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-3 py-1 border rounded">
              Volver
            </button>
            <button
              onClick={handleExportPDF}
              disabled={exporting}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
            >
              {exporting ? "Generando..." : "Exportar PDF"}
            </button>
          </div>
        </div>

        <div
          ref={reportRef}
          id="report-content"
          className="bg-white rounded-lg shadow-md p-4"
        >
          {content}
        </div>
      </div>
    );
  }

  // 💬 Modo modal
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg overflow-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Reporte de publicación</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <X />
          </button>
        </div>

        <div ref={reportRef} className="p-6 space-y-4" id="report-content">
          {content}
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
