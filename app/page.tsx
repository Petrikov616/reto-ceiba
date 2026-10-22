'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AtsBuk() {
  const [postulantesBuk, setPostulantesBuk] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const cargarPostulantesBuk = async () => {
    try {
      const res = await fetch('/api/postulantes');
      const data = await res.json();
      if (data.success) {
        setPostulantesBuk(data.postulantes);
      }
    } catch (e) {
      console.error("Error cargando BUK mock");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPostulantesBuk();
    const interval = setInterval(cargarPostulantesBuk, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-8 flex flex-col items-center">
      <div className="max-w-6xl w-full">
        {/* Navbar */}
        <header className="mb-6 border-b border-slate-800 pb-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-emerald-400 font-mono">ceiba</span>
            <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-700 px-2.5 py-1 rounded-full font-medium">
              BUK ATS - Módulo Selección
            </span>
          </div>

          <div className="flex gap-3">
            <Link
              href="/simulador"
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 shadow-md"
            >
              <span> Ir al Simulador LinkedIn</span>
            </Link>
          </div>
        </header>

        {/* Banner Informativo */}
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-semibold text-slate-200">
              Vacante Activa: 3924 Practicante de Contratación Pública / Desarrollo
            </h2>
            <p className="text-xs text-slate-400">
              Integración automatizada con Middleware Mock API - Actualización en tiempo real
            </p>
          </div>
          <span className="text-xs bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg text-slate-300 font-mono">
            Postulantes recibidos: {postulantesBuk.length}
          </span>
        </div>

        {/* Tabla BUK ATS */}
        <section className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
          <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-3">
            <h3 className="text-base font-semibold text-slate-200 flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
              Etapa: Postulantes (Pendientes de Filtro)
            </h3>
            <button
              onClick={cargarPostulantesBuk}
              className="text-xs bg-slate-900 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded border border-slate-700 transition"
            >
              Refrescar
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase font-mono">
                <tr>
                  <th className="p-3">ID BUK</th>
                  <th className="p-3">Candidato</th>
                  <th className="p-3">Ubicación</th>
                  <th className="p-3">ID Vacante</th>
                  <th className="p-3">CV & Enlaces</th>
                  <th className="p-3">Fuente (BUK)</th>
                  <th className="p-3">Origen Específico</th>
                  <th className="p-3">Estado ATS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-slate-400">
                      Cargando postulantes de BUK...
                    </td>
                  </tr>
                ) : postulantesBuk.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500">
                      No hay postulantes registrados en esta vacante.
                      <br />
                      <Link href="/simulador" className="text-blue-400 underline font-medium mt-2 inline-block">
                        Simular envío desde LinkedIn ➔
                      </Link>
                    </td>
                  </tr>
                ) : (
                  postulantesBuk.map((c, index) => (
                    <tr key={index} className="hover:bg-slate-750 transition">
                      <td className="p-3 font-mono text-blue-400 font-bold">{c.id}</td>
                      <td className="p-3 font-medium text-white">
                        {c.nombres} {c.apellidos} <br />
                        <span className="text-slate-400 font-normal">{c.email} • {c.telefono}</span>
                      </td>
                      <td className="p-3 text-slate-300">
                        {c.ciudad}, {c.pais}
                      </td>
                      <td className="p-3 font-mono text-emerald-400">{c.vacancy_id}</td>
                      <td className="p-3 space-x-2">
                        <a href={c.cv_url} target="_blank" className="text-blue-400 underline hover:text-blue-300">PDF CV</a>
                        {c.perfil_linkedin && c.perfil_linkedin !== "No proporcionado" && (
                          <>
                            <span>|</span>
                            <a href={c.perfil_linkedin} target="_blank" className="text-blue-400 underline hover:text-blue-300">LinkedIn</a>
                          </>
                        )}
                      </td>
                      {/* Fuente General BUK */}
                      <td className="p-3 whitespace-nowrap">
                        <span className="bg-slate-900 text-slate-300 border border-slate-700 px-2.5 py-1 rounded text-[10px] font-mono inline-block">
                          Importadores Curriculum
                        </span>
                      </td>
                      {/* Origen Específico LinkedIn */}
                      <td className="p-3 whitespace-nowrap">
                        <span className="bg-blue-950 text-blue-300 border border-blue-700 px-2.5 py-1 rounded text-[10px] font-semibold inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                          LinkedIn
                        </span>
                      </td>
                      
                      <td className="p-3">
                        <span className="bg-amber-950/80 text-amber-300 border border-amber-800 px-2 py-0.5 rounded text-[10px] font-semibold">
                          {c.estado}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}