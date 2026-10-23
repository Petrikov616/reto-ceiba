'use client';
import { useState, useEffect } from 'react';

interface Postulante {
    id: string | number;
    nombres: string;
    apellidos?: string;
    email?: string;
    telefono?: string;
    pais?: string;
    ciudad?: string;
    vacancy_id?: string;
    vacanteId?: string;
    cv_url?: string;
    enlaceCv?: string;
    perfil_linkedin?: string;
    perfilLinkedin?: string;
    estado?: string;
    fecha_postulacion?: string;
    createdAt?: string;
}

// Corrección 1: Se corrigió 'supendido' por 'suspendido'
const etapas = [
    { id: 'postulantes', titulo: 'Postulantes' },
    { id: 'contactar', titulo: 'Por contactar' },
    { id: 'prueba', titulo: 'Prueba técnica' },
    { id: 'entrevista', titulo: 'Entrevista técnica' },
    { id: 'psicologica', titulo: 'Valoración psicológica' },
    { id: 'suspendido', titulo: 'Suspendido' },
];

export default function KanbanBoard() {
    const [postulantes, setPostulantes] = useState<Postulante[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Estado para controlar qué postulante se está viendo en el modal
    const [postulanteSeleccionado, setPostulanteSeleccionado] = useState<Postulante | null>(null);

    const obtenerPostulantes = async () => {
        try {
            const res = await fetch('/api/postulantes');
            if (res.ok) {
                const data = await res.json();
                setPostulantes(Array.isArray(data.postulantes) ? data.postulantes : []);
            }
        } catch (error) {
            console.error("Error al cargar postulantes:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        obtenerPostulantes();
    }, []);

    const handleDragStart = (e: React.DragEvent, id: string | number) => {
        e.dataTransfer.setData('text/plain', id.toString());
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    // Función unificada para actualizar el estado en UI y servidor (PUT)
    const actualizarEstadoCandidato = async (id: string | number, nuevoEstado: string) => {
        // 1. Actualización en memoria local
        setPostulantes(prev => prev.map(p => {
            if (p.id.toString() === id.toString()) {
                return { ...p, estado: nuevoEstado };
            }
            return p;
        }));

        // Si el modal está abierto con este candidato, actualizamos el modal también
        if (postulanteSeleccionado && postulanteSeleccionado.id.toString() === id.toString()) {
            setPostulanteSeleccionado(prev => prev ? { ...prev, estado: nuevoEstado } : null);
        }

        // 2. Persistencia en Backend mediante PUT
        try {
            await fetch('/api/postulantes', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id, nuevoEstado: nuevoEstado })
            });
        } catch (error) {
            console.error("Error actualizando estado en el servidor:", error);
        }
    };

    const handleDrop = async (e: React.DragEvent, targetEstado: string) => {
        e.preventDefault();
        const id = e.dataTransfer.getData('text/plain');
        if (!id) return;
        await actualizarEstadoCandidato(id, targetEstado);
    };

    if (loading) {
        return (
            <div className="text-center py-10 text-slate-400 text-sm">
                Cargando postulantes de BUK ATS...
            </div>
        );
    }

    return (
        <div className="w-full relative">
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {etapas.map((etapa) => {
                    const postulantesColumna = Array.isArray(postulantes)
                        ? postulantes.filter(p => (p.estado || 'postulantes') === etapa.id)
                        : [];

                    return (
                        <div
                            key={etapa.id}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, etapa.id)}
                            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl flex flex-col min-h-[380px] shadow-lg"
                        >
                            {/* Cabecera de Columna */}
                            <div className="p-2.5 border-b border-slate-700/80 flex justify-between items-center bg-slate-800 rounded-t-xl">
                                <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wide truncate">
                                    {etapa.titulo}
                                </span>
                                <span className="text-[10px] bg-slate-700/80 text-slate-300 px-2 py-0.5 rounded-full font-mono font-semibold">
                                    {postulantesColumna.length}
                                </span>
                            </div>

                            {/* Zona de Arrastre / Postulantes */}
                            <div className="p-2 overflow-y-auto space-y-2 flex-1 min-h-[140px]">
                                {postulantesColumna.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-center p-4 text-[11px] text-slate-500 italic border border-dashed border-slate-700/40 rounded-lg">
                                        Arrastra aquí
                                    </div>
                                ) : (
                                    postulantesColumna.map((postulante) => (
                                        <div
                                            key={postulante.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, postulante.id)}
                                            onClick={() => setPostulanteSeleccionado(postulante)}
                                            className="bg-slate-900 border border-slate-700 hover:border-blue-500 p-2.5 rounded-lg shadow space-y-1.5 cursor-pointer active:cursor-grabbing transition group"
                                        >
                                            <div className="font-semibold text-xs text-slate-100 flex items-center justify-between">
                                                <span className="truncate">
                                                    {postulante.nombres} {postulante.apellidos || ''}
                                                </span>
                                                <span className="text-[10px] text-slate-600 group-hover:text-slate-400">⠿</span>
                                            </div>

                                            <div className="flex justify-between items-center text-[10px] text-slate-400">
                                                <span className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700/80 font-mono text-[9px]">
                                                    {postulante.vacancy_id || postulante.vacanteId || 'VAC-3924'}
                                                </span>
                                                <span>
                                                    {postulante.fecha_postulacion || postulante.createdAt
                                                        ? new Date(postulante.fecha_postulacion || postulante.createdAt!).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
                                                        : 'Hoy'}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="p-2 border-t border-slate-700/40 text-center text-[10px] text-slate-400 bg-slate-800/30 rounded-b-xl">
                                Descartados (0)
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal de Detalle y Acciones del Candidato */}
            {postulanteSeleccionado && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl relative space-y-4">

                        <button
                            onClick={() => setPostulanteSeleccionado(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold"
                        >
                            ✕
                        </button>

                        <div className="border-b border-slate-700 pb-3">
                            <span className="text-[10px] bg-blue-900/60 text-blue-300 border border-blue-700/50 px-2 py-0.5 rounded-full font-mono uppercase">
                                {postulanteSeleccionado.vacancy_id || postulanteSeleccionado.vacanteId || 'VAC-3924'}
                            </span>
                            <h2 className="text-xl font-bold text-slate-100 mt-2">
                                {postulanteSeleccionado.nombres} {postulanteSeleccionado.apellidos || ''}
                            </h2>
                            <p className="text-xs text-slate-400">
                                {postulanteSeleccionado.ciudad || 'Medellín'}, {postulanteSeleccionado.pais || 'Colombia'}
                            </p>
                        </div>

                        <div className="space-y-2 text-xs text-slate-300">
                            <div>
                                <span className="text-slate-500 block">Correo electrónico:</span>
                                <span className="font-mono text-slate-200">{postulanteSeleccionado.email || 'No especificado'}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block">Teléfono / Celular:</span>
                                <span className="font-mono text-slate-200">{postulanteSeleccionado.telefono || 'No especificado'}</span>
                            </div>
                        </div>

                        <div className="pt-2 flex flex-col gap-2">
                            {/* Ver CV en PDF */}
                            {(postulanteSeleccionado.cv_url || postulanteSeleccionado.enlaceCv) && (
                                <a
                                    href={postulanteSeleccionado.cv_url || postulanteSeleccionado.enlaceCv}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-slate-700 hover:bg-slate-600 text-slate-100 text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition font-medium border border-slate-600"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                        <polyline points="14 2 14 8 20 8" />
                                    </svg>
                                    Ver Hoja de Vida (PDF)
                                </a>
                            )}

                            {/* Ver Perfil de LinkedIn */}
                            {(postulanteSeleccionado.perfil_linkedin || postulanteSeleccionado.perfilLinkedin) && (
                                <a
                                    href={postulanteSeleccionado.perfil_linkedin || postulanteSeleccionado.perfilLinkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition font-medium shadow-md"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                                        <rect x="2" y="9" width="4" height="12" />
                                        <circle cx="4" cy="4" r="2" />
                                    </svg>
                                    <span>Ver Perfil de LinkedIn</span>
                                </a>
                            )}

                            {/* Opción 2: Botón de Reactivación o Suspensión en el Modal */}
                            {postulanteSeleccionado.estado === 'suspendido' ? (
                                <button
                                    onClick={() => {
                                        actualizarEstadoCandidato(postulanteSeleccionado.id, 'contactar');
                                        setPostulanteSeleccionado(null);
                                    }}
                                    className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs py-2.5 px-4 rounded-xl transition font-medium shadow flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-circle-fading-plus preview-icon">
                                    <path d="M12 2a10 10 0 0 1 7.38 16.75"/><path d="M12 8v8"/><path d="M16 12H8"/><path d="M2.5 8.875a10 10 0 0 0-.5 3"/>
                                    <path d="M2.83 16a10 10 0 0 0 2.43 3.4"/>
                                    <path d="M4.636 5.235a10 10 0 0 1 .891-.857"/>
                                    <path d="M8.644 21.42a10 10 0 0 0 7.631-.38"/>
                                    </svg>

                                    Reactivar Postulante

                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        actualizarEstadoCandidato(postulanteSeleccionado.id, 'suspendido');
                                        setPostulanteSeleccionado(null);
                                    }}
                                    className="w-full mt-2 bg-red-950/80 hover:bg-yellow-900 border border-yellow-700/60 text-black-300 text-xs py-2 px-4 rounded-xl transition font-medium flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-circle-slash preview-icon">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="9" x2="15" y1="15" y2="9"/>
                                    </svg>

                                    Suspender Postulante

                                </button>
                            )}
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}