
import { ROUTES } from "@/app/constants/routes";
import KanbanBoard from "@/app/components/KanbanBoard";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 bg-[#F8FAFC] text-buk-text">
      {/* Top bar con search y usuario */}
      <div className="bg-white border-b border-buk-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
          </div>
        </div>
        <div className="flex items-center gap-3">
        </div>
      </div>

      {/* Header del proceso de selección */}
      <div className="px-6 py-4 bg-white border-b border-buk-border">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
            </div>
            <h1 className="text-lg font-bold text-buk-text flex items-center gap-2.5">
              Practicantes en Contratación Pública
            </h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
          </div>
        </div>
      </div>

      <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={ROUTES.SIMULADOR}
            className="bg-buk-success hover:bg-emerald-700 text-white text-xs px-4 py-2 rounded-lg transition shadow-sm font-semibold flex items-center gap-1.5"
          >
            Nueva postulación →
          </Link>
        </div>
      </div>

      {/* Tablero Kanban */}
      <div className="px-6 pb-6">
        <KanbanBoard />
      </div>
    </main>
  );
}