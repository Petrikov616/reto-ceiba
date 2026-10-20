'use client';

import { useState, useEffect, ChangeEvent } from 'react';

interface FormData {
  nombreCompleto: string;
  email: string;
  telefono: string;
  enlaceCv: string;
  vacanteId: string;
  perfilLinkedin: string;
}

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    nombreCompleto: 'Carlos Andrés Gómez',
    email: 'carlos.gomez@ejemplo.com',
    telefono: '+57 310 987 6543',
    enlaceCv: 'https://ejemplo.com/cv-carlos-gomez.pdf',
    vacanteId: 'VAC-DESARROLLO-01',
    perfilLinkedin: 'https://linkedin.com/in/carlosgomez-dev'
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [postulantesBuk, setPostulantesBuk] = useState<any[]>([]);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Cargar los postulantes simulados que ya están en BUK al abrir la página
  const cargarPostulantesBuk = async () => {
    try {
      const res = await fetch('/api/postulantes');
      const data = await res.json();
      if (data.success) {
        setPostulantesBuk(data.postulantes);
      }
    } catch (e) {
      console.error("Error cargando BUK mock");
    }
  };

  useEffect(() => {
    cargarPostulantesBuk();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMensajeExito(null);

    try {
      const res = await fetch('/api/postulantes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        setMensajeExito(`¡Candidato ${formData.nombreCompleto} sincronizado con BUK exitosamente!`);
        cargarPostulantesBuk(); // Recargar la lista de BUK
      }
    } catch (error) {
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-8 flex flex-col items-center">
      <div className="max-w-5xl w-full">
        {/* Cabecera */}
        <header className="mb-8 border-b border-slate-800 pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-400">
              Prototipo Middleware: LinkedIn ➔ BUK ATS (Entorno Simulado)
            </h1>
            <p className="text-sm text-slate-400">
              Reto Ceiba Software - Solución sin dependencia de APIs externas bloqueadas
            </p>
          </div>
          <span className="bg-emerald-900/50 text-emerald-300 border border-emerald-700 text-xs px-3 py-1 rounded-full font-medium">
            Mock Activo ✓
          </span>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Formulario Simulador de LinkedIn */}
          <section className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
            <h2 className="text-lg font-semibold mb-4 text-slate-200 border-b border-slate-700 pb-2 flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full inline-block"></span>
              1. Simular Postulación desde LinkedIn
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  name="nombreCompleto"
                  value={formData.nombreCompleto}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Teléfono</label>
                  <input
                    type="text"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">ID Vacante (BUK)</label>
                  <input
                    type="text"
                    name="vacanteId"
                    value={formData.vacanteId}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">URL del CV (PDF)</label>
                <input
                  type="url"
                  name="enlaceCv"
                  value={formData.enlaceCv}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Perfil de LinkedIn</label>
                <input
                  type="url"
                  name="perfilLinkedin"
                  value={formData.perfilLinkedin}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-medium py-2.5 px-4 rounded-lg transition text-sm shadow-md mt-4"
              >
                {loading ? 'Procesando en Middleware...' : '🚀 Enviar Postulación (Simular Clic en LinkedIn)'}
              </button>
            </div>
          </section>

          {/* Panel de Estado y Respuesta */}
          <section className="flex flex-col gap-4">
            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex-1 flex flex-col justify-center">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">
                ⚡ Estado del Puente (Middleware)
              </h3>
              {mensajeExito ? (
                <div className="bg-emerald-950 border border-emerald-700 text-emerald-300 p-4 rounded-lg text-xs leading-relaxed">
                  <p className="font-bold mb-1">✓ ¡Sincronización Exitosa!</p>
                  <p>{mensajeExito}</p>
                  <p className="mt-2 text-slate-400">El candidato ya fue transformado e inyectado en BUK automáticamente.</p>
                </div>
              ) : (
                <p className="text-xs text-slate-500 text-center py-8">
                  Haz clic en el botón de la izquierda para simular el ingreso de un candidato desde LinkedIn y ver cómo viaja por el middleware.
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Sección inferior: Simulando el ATS BUK real */}
        <section className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
          <h2 className="text-lg font-semibold mb-4 text-slate-200 border-b border-slate-700 pb-2 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-500 rounded-full inline-block"></span>
              2. Vista en el ATS BUK (Candidatos en espera de postulación)
            </span>
            <span className="text-xs bg-slate-900 px-3 py-1 rounded text-slate-400 border border-slate-700">
              Total Registrados: {postulantesBuk.length}
            </span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase font-mono">
                <tr>
                  <th className="p-3">ID BUK</th>
                  <th className="p-3">Candidato</th>
                  <th className="p-3">Vacante</th>
                  <th className="p-3">CV / LinkedIn</th>
                  <th className="p-3">Estado inicial</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {postulantesBuk.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-500">
                      Aún no hay postulaciones registradas. ¡Simula una arriba!
                    </td>
                  </tr>
                ) : (
                  postulantesBuk.map((c, index) => (
                    <tr key={index} className="hover:bg-slate-750">
                      <td className="p-3 font-mono text-blue-400">{c.id}</td>
                      <td className="p-3 font-medium text-white">
                        {c.nombre} <br />
                        <span className="text-slate-400 font-normal">{c.email}</span>
                      </td>
                      <td className="p-3 font-mono text-emerald-400">{c.vacancy_id}</td>
                      <td className="p-3 space-x-2">
                        <a href={c.cv_url} target="_blank" className="text-blue-400 underline">CV PDF</a>
                        <span>|</span>
                        <a href={c.perfil_linkedin} target="_blank" className="text-blue-400 underline">LinkedIn</a>
                      </td>
                      <td className="p-3">
                        <span className="bg-amber-950 text-amber-300 border border-amber-700 px-2 py-0.5 rounded text-[10px] font-semibold">
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