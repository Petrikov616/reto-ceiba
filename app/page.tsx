
import { ROUTES } from "@/app/constants/routes";
import KanbanBoard from "@/app/components/KanbanBoard";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-8 flex flex-col items-center">
      <div className="max-w-7xl w-full">
        
        {/* Cabecera del Panel BUK ATS */}
        <header className="mb-6 border-b border-slate-800 pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
              <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-xs">BUK</span>
              Panel ATS - Ceiba
            </h1>
            <p className="text-xs text-slate-400">
              Gestión y seguimiento de postulantes en tiempo real
            </p>
          </div>

          {/* Enlace para ir al Simulador */}
          <Link
            href={ROUTES.SIMULADOR}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3.5 py-2 rounded-lg transition shadow-md flex items-center gap-2 font-medium"
          >
            Ir al Simulador LinkedIn →
          </Link>
        </header>

        {/* Tablero Kanban principal */}
        <KanbanBoard />

      </div>
    </main>
  );
}