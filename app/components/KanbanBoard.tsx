'use client';
import { useState, useEffect } from 'react';
import { showToast } from '@/app/components/Toast';

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

const etapas = [
    { id: 'postulantes', titulo: 'Postulantes', color: 'bg-gray-100' },
    { id: 'contactar', titulo: 'Por contactar', color: 'bg-blue-50' },
    { id: 'prueba', titulo: 'Prueba técnica', color: 'bg-amber-50' },
    { id: 'entrevista', titulo: 'Entrevista técnica', color: 'bg-teal-50' },
    { id: 'psicologica', titulo: 'Valoración psicológica', color: 'bg-indigo-50' },
    { id: 'suspendido', titulo: 'Suspendido', color: 'bg-red-50' },
];

// Colores para avatares según inicial del nombre
const avatarColors = [
    'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500',
    'bg-rose-500', 'bg-teal-500', 'bg-indigo-500', 'bg-cyan-500',
];

function getAvatarColor(name: string): string {
    const charCode = name.charCodeAt(0) || 0;
    return avatarColors[charCode % avatarColors.length];
}

function getInitials(nombres: string, apellidos?: string): string {
    const first = nombres.charAt(0).toUpperCase();
    const last = apellidos ? apellidos.charAt(0).toUpperCase() : '';
    return first + last;
}

export default function KanbanBoard() {
    const [postulantes, setPostulantes] = useState<Postulante[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [postulanteSeleccionado, setPostulanteSeleccionado] = useState<Postulante | null>(null);
    const [descartadosAbiertos, setDescartadosAbiertos] = useState<Record<string, boolean>>({});

    const obtenerPostulantes = async () => {
        try {
            const res = await fetch('/api/postulantes');
            if (res.ok) {
                const data = await res.json();
                const lista: Postulante[] = Array.isArray(data.postulantes) ? data.postulantes : [];
                setPostulantes(lista);
            }
        } catch (error) {
            console.error("Error al cargar postulantes:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        obtenerPostulantes();
        // Auto-refresh cada 4 segundos
        const interval = setInterval(obtenerPostulantes, 4000);
        return () => clearInterval(interval);
    }, []);

    const handleDragStart = (e: React.DragEvent, id: string | number) => {
        e.dataTransfer.setData('text/plain', id.toString());
        (e.target as HTMLElement).style.opacity = '0.5';
    };

    const handleDragEnd = (e: React.DragEvent) => {
        (e.target as HTMLElement).style.opacity = '1';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        (e.currentTarget as HTMLElement).classList.add('ring-2', 'ring-buk-primary/30');
    };

    const handleDragLeave = (e: React.DragEvent) => {
        (e.currentTarget as HTMLElement).classList.remove('ring-2', 'ring-buk-primary/30');
    };

    const actualizarEstadoCandidato = async (id: string | number, nuevoEstado: string) => {
        setPostulantes(prev => prev.map(p => {
            if (p.id.toString() === id.toString()) {
                return { ...p, estado: nuevoEstado };
            }
            return p;
        }));

        if (postulanteSeleccionado && postulanteSeleccionado.id.toString() === id.toString()) {
            setPostulanteSeleccionado(prev => prev ? { ...prev, estado: nuevoEstado } : null);
        }

        try {
            await fetch('/api/postulantes', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id, nuevoEstado: nuevoEstado })
            });
            const etapa = etapas.find(e => e.id === nuevoEstado);
            showToast('info', `Candidato movido a "${etapa?.titulo || nuevoEstado}"`);
        } catch (error) {
            console.error("Error actualizando estado en el servidor:", error);
            showToast('error', 'Error al actualizar el estado del candidato');
        }
    };

    const handleDrop = async (e: React.DragEvent, targetEstado: string) => {
        e.preventDefault();
        (e.currentTarget as HTMLElement).classList.remove('ring-2', 'ring-buk-primary/30');
        const id = e.dataTransfer.getData('text/plain');
        if (!id) return;
        await actualizarEstadoCandidato(id, targetEstado);
    };
    return (
        <div className="w-full relative">
            <div className="w-full flex justify-center gap-3 overflow-x-auto pb-2">
                {etapas.map((etapa) => {
const postulantesColumna = Array.isArray(postulantes)
? postulantes.filter(p => p.estado === etapa.id)
: [];
                    const isDescartadosOpen = descartadosAbiertos[etapa.id] || false;

                    return (
                        <div
                            key={etapa.id}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, etapa.id)}
                            className="min-w-[200px] w-[200px] flex-shrink-0 bg-buk-bg-column border border-buk-border rounded-xl flex flex-col transition-all"
                        >
                            {/* Header de columna */}
                            <div className="p-3 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-buk-text tracking-wide">
                                        {etapa.titulo}
                                    </span>
                                    <span className="text-[10px] bg-white text-buk-text-secondary px-1.5 py-0.5 rounded-full font-semibold border border-buk-border">
                                        {postulantesColumna.length}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button className="text-buk-text-secondary hover:text-buk-text p-0.5 transition">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                                        </svg>
                                    </button>
                                    <button className="text-buk-text-secondary hover:text-buk-text p-0.5 transition">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="5" r="1" />
                                            <circle cx="12" cy="12" r="1" />
                                            <circle cx="12" cy="19" r="1" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Tarjetas */}
                            <div className="px-2 pb-2 overflow-y-auto space-y-2 flex-1 min-h-[160px]">
                                {postulantesColumna.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-center p-4 text-[11px] text-buk-text-secondary italic border-2 border-dashed border-gray-200 rounded-lg bg-white/50">
                                        Arrastra candidatos aquí
                                    </div>
                                ) : (
                                    postulantesColumna.map((postulante) => (
                                        <div
                                            key={postulante.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, postulante.id)}
                                            onDragEnd={handleDragEnd}
                                            onClick={() => setPostulanteSeleccionado(postulante)}
                                            className="bg-white border border-buk-border hover:border-buk-primary hover:shadow-md p-3 rounded-lg shadow-sm cursor-pointer active:cursor-grabbing transition-all group"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                {/* Avatar */}
                                                <div className={`w-8 h-8 rounded-full ${getAvatarColor(postulante.nombres)} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                                                    {getInitials(postulante.nombres, postulante.apellidos)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold text-buk-text truncate leading-tight">
                                                        {postulante.nombres} {postulante.apellidos || ''}
                                                    </p>
                                                    {/* Fecha de postulación limpia sin estrellas */}
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] text-buk-text-secondary">
                                                            {postulante.fecha_postulacion || postulante.createdAt
                                                                ? new Date(postulante.fecha_postulacion || postulante.createdAt!).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
                                                                : 'Hoy'}
                                                        </span>
                                                    </div>
                                                </div>
                                                {/* Checkbox decorativo */}
                                                <div className="w-4 h-4 border border-gray-300 rounded flex-shrink-0 group-hover:border-buk-primary transition" />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal de Detalle */}
            {
                postulanteSeleccionado && (
                    <div
                        className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50 flex items-center justify-center p-4"
                        onClick={(e) => { if (e.target === e.currentTarget) setPostulanteSeleccionado(null); }}
                    >
                        <div className="bg-white border border-buk-border w-full max-w-md rounded-2xl shadow-2xl relative overflow-hidden">
                            {/* Header del modal con color */}
                            <div className="bg-gradient-to-r from-buk-primary to-blue-500 px-6 pt-6 pb-10">
                                <button
                                    onClick={() => setPostulanteSeleccionado(null)}
                                    className="absolute top-4 right-4 text-white/70 hover:text-white text-lg font-bold transition bg-white/10 rounded-full w-7 h-7 flex items-center justify-center"
                                >
                                    ✕
                                </button>
                                <span className="text-[10px] bg-white/20 text-white px-2.5 py-0.5 rounded-full font-mono uppercase">
                                    {postulanteSeleccionado.vacancy_id || postulanteSeleccionado.vacanteId || 'VAC-3924'}
                                </span>
                            </div>

                            {/* Avatar sobre el header */}
                            <div className="px-6 -mt-8 relative z-10">
                                <div className={`w-16 h-16 rounded-full ${getAvatarColor(postulanteSeleccionado.nombres)} flex items-center justify-center text-white text-xl font-bold border-4 border-white shadow-lg`}>
                                    {getInitials(postulanteSeleccionado.nombres, postulanteSeleccionado.apellidos)}
                                </div>
                            </div>

                            {/* Info del candidato */}
                            <div className="px-6 pt-3 pb-6 space-y-4">
                                <div>
                                    <h2 className="text-xl font-bold text-buk-text">
                                        {postulanteSeleccionado.nombres} {postulanteSeleccionado.apellidos || ''}
                                    </h2>
                                    <p className="text-sm text-buk-text-secondary flex items-center gap-1.5 mt-0.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                        {postulanteSeleccionado.ciudad || 'Medellín'}, {postulanteSeleccionado.pais || 'Colombia'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <span className="text-[10px] text-buk-text-secondary uppercase tracking-wider font-semibold block mb-1">Correo</span>
                                        <span className="text-xs text-buk-text font-medium break-all">{postulanteSeleccionado.email || 'No especificado'}</span>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <span className="text-[10px] text-buk-text-secondary uppercase tracking-wider font-semibold block mb-1">Teléfono</span>
                                        <span className="text-xs text-buk-text font-medium">{postulanteSeleccionado.telefono || 'No especificado'}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 pt-1">
                                    {(postulanteSeleccionado.cv_url || postulanteSeleccionado.enlaceCv) && (
                                        <a
                                            href={postulanteSeleccionado.cv_url || postulanteSeleccionado.enlaceCv}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full bg-gray-50 hover:bg-gray-100 text-buk-text text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition font-medium border border-buk-border"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                                <polyline points="14 2 14 8 20 8" />
                                            </svg>
                                            Ver Hoja de Vida (PDF)
                                        </a>
                                    )}

                                    {(postulanteSeleccionado.perfil_linkedin || postulanteSeleccionado.perfilLinkedin) && (
                                        <a
                                            href={postulanteSeleccionado.perfil_linkedin || postulanteSeleccionado.perfilLinkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full bg-[#0A66C2] hover:bg-[#004182] text-white text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition font-medium shadow-sm"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                                                <rect x="2" y="9" width="4" height="12" />
                                                <circle cx="4" cy="4" r="2" />
                                            </svg>
                                            Ver Perfil de LinkedIn
                                        </a>
                                    )}

                                    {postulanteSeleccionado.estado === 'suspendido' ? (
                                        <button
                                            onClick={() => {
                                                actualizarEstadoCandidato(postulanteSeleccionado.id, 'contactar');
                                                setPostulanteSeleccionado(null);
                                                showToast('success', `${postulanteSeleccionado.nombres} ha sido reactivado exitosamente`);
                                            }}
                                            className="w-full mt-1 bg-buk-success hover:bg-emerald-700 text-white text-xs py-2.5 px-4 rounded-xl transition font-medium shadow-sm flex items-center justify-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M12 2a10 10 0 0 1 7.38 16.75" />
                                                <path d="M12 8v8" />
                                                <path d="M16 12H8" />
                                                <path d="M2.5 8.875a10 10 0 0 0-.5 3" />
                                                <path d="M2.83 16a10 10 0 0 0 2.43 3.4" />
                                                <path d="M4.636 5.235a10 10 0 0 1 .891-.857" />
                                                <path d="M8.644 21.42a10 10 0 0 0 7.631-.38" />
                                            </svg>
                                            Reactivar Postulante
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                actualizarEstadoCandidato(postulanteSeleccionado.id, 'suspendido');
                                                setPostulanteSeleccionado(null);
                                                showToast('warning', `${postulanteSeleccionado.nombres} ha sido suspendido`);
                                            }}
                                            className="w-full mt-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs py-2.5 px-4 rounded-xl transition font-medium flex items-center justify-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10" />
                                                <line x1="9" x2="15" y1="15" y2="9" />
                                            </svg>
                                            Suspender Postulante
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}