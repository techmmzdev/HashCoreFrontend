import React, { useEffect, useMemo, useState } from "react";
import ReportModal from "@/components/admin/ReportModal";
import { useNavigate } from "react-router-dom";
import { getAdminPublications } from "@/api/publication";
import { getClientById } from "@/api/client";
import { Loader2 } from "lucide-react";
import toast from "@/utils/toast";

const ReportsPage = () => {
  const navigate = useNavigate();

  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedPublication, setSelectedPublication] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleClose = () => {
    // Volver al dashboard admin
    navigate("/admin/dashboard");
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const all = await getAdminPublications();
        setPublications(all || []);
      } catch (err) {
        console.error(err);
        toast.error("No se pudieron cargar las publicaciones.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filtered = useMemo(() => {
    const byStatus = publications.filter((p) => {
      if (statusFilter === "ALL") return true;
      return (p.status || "").toString().toUpperCase() === statusFilter;
    });

    if (!q) return byStatus;
    const tq = q.toLowerCase();
    return byStatus.filter((p) => {
      const title = (p.title || "").toLowerCase();
      const description = (p.description || "").toLowerCase();
      const clientId = (p.client_id || "").toString().toLowerCase();
      return (
        title.includes(tq) || description.includes(tq) || clientId.includes(tq)
      );
    });
  }, [publications, q, statusFilter]);

  const openReport = async (pub) => {
    setSelectedPublication(pub);
    setSelectedClient(null);
    setModalOpen(true);
    // fetch client info if missing
    try {
      if (pub?.client_id) {
        const clientData = await getClientById(pub.client_id);
        setSelectedClient(clientData || null);
      }
    } catch (err) {
      console.error(err);
      // no crítico, el modal abrirá con client=null
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedPublication(null);
    setSelectedClient(null);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Reportes</h1>
        <div className="flex items-center gap-2">
          <button onClick={handleClose} className="px-3 py-1 border rounded">
            Volver
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded bg-white"
        >
          <option value="ALL">Todos</option>
          <option value="PENDING">Pendiente</option>
          <option value="DRAFT">Borrador</option>
          <option value="PUBLISHED">Publicado</option>
          <option value="REJECTED">Rechazado</option>
        </select>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por título, descripción o cliente"
          className="px-3 py-2 border rounded flex-1"
        />
      </div>

      <div>
        {loading ? (
          <div className="min-h-[200px] flex items-center justify-center">
            <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-gray-500">No se encontraron publicaciones.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="p-3 border rounded bg-white dark:bg-gray-800 flex items-center justify-between"
              >
                <div>
                  <h3 className="font-semibold">{p.title || "Sin título"}</h3>
                  <p className="text-sm text-gray-500">Estado: {p.status}</p>
                  <p className="text-sm text-gray-500">
                    Cliente: {p.client_id}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openReport(p)}
                    className="px-3 py-1 bg-indigo-600 text-white rounded"
                  >
                    Generar reporte
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ReportModal
        open={modalOpen}
        onClose={closeModal}
        publication={selectedPublication}
        client={selectedClient}
        asPage={false}
      />
    </div>
  );
};

export default ReportsPage;
