'use client';
import { ROUTES } from "@/app/constants/routes";
import { useState, ChangeEvent, useEffect } from 'react';
import Link from 'next/link';
import { showToast } from '@/app/components/Toast';

interface FormData {
    nombres: string;
    apellidos: string;
    email: string;
    telefono: string;
    enlaceCv: string;
    vacanteId: string;
    perfilLinkedin: string;
    pais: string;
    ciudad: string;
}

interface PostulanteReciente {
    id: string | number;
    nombres: string;
    apellidos: string;
    email?: string;
    telefono?: string;
    estado?: string;
    pais: string;
    ciudad: string;
}

const datosPaises: Record<string, { codigo: string; ciudades: string[] }> = {
    "Colombia": { codigo: "+57", ciudades: ["Barranquilla", "Bucaramanga", "Cali", "Medellín"] },
    "Chile": { codigo: "+56", ciudades: ["Antofagasta", "La Serena", "Santiago"] },
    "Argentina": { codigo: "+54", ciudades: ["La Plata", "Mendoza", "Rosario"] },
    "España": { codigo: "+34", ciudades: ["Barcelona", "Sevilla", "Valencia", "Zaragoza"] },
    "Perú": { codigo: "+51", ciudades: ["Lima", "Piura", "Trujillo"] },
    "México": { codigo: "+52", ciudades: ["Ciudad de México", "Guadalajara", "Monterrey", "Puebla", "Tijuana"] }
};


const initialFormData: FormData = {
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '+57',
    enlaceCv: '',
    vacanteId: 'VAC-3924',
    perfilLinkedin: '',
    pais: 'Colombia',
    ciudad: 'Medellín'
};

export default function SimuladorLinkedin() {
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [loading, setLoading] = useState<boolean>(false);
    const [mensajeExito, setMensajeExito] = useState<string | null>(null);

    const [postulantesRecientes, setPostulantesRecientes] = useState<PostulanteReciente[]>([])

    const cargarPostulantesRecientes = async () => {
        try {
            const res = await fetch('/api/postulantes');
            if (res.ok) {
                const data = await res.json();
                const lista: PostulanteReciente[] = Array.isArray(data.postulantes) ? data.postulantes : [];

                // Filtramos únicamente los que siguen retenidos en cola
                const enCola = lista.filter(p => p.estado === 'en_cola');

                setPostulantesRecientes(enCola);

                // Guardamos respaldo en localStorage para persistencia tras refrescar
                localStorage.setItem('postulantes_en_cola', JSON.stringify(enCola));
            }
        } catch (error) {
            // Si la red o API tarda, intentamos recuperar desde localStorage
            const guardados = localStorage.getItem('postulantes_en_cola');
            if (guardados) {
                setPostulantesRecientes(JSON.parse(guardados));
            }
        }
    };
    useEffect(() => {
        // Cargar inmediatamente de localStorage para evitar parpadeos al recargar
        const guardados = localStorage.getItem('postulantes_en_cola');
        if (guardados) {
            setPostulantesRecientes(JSON.parse(guardados));
        }

        // Sincronizar con los datos más recientes de la API
        cargarPostulantesRecientes();
    }, []);


    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const paisSeleccionado = e.target.value;
        const datosPais = datosPaises[paisSeleccionado];

        setFormData((prev) => {
            // Extraemos solo los dígitos que el usuario ya haya ingresado (si los hay)
            const numeroLimpio = prev.telefono.replace(/^\+\d+\s*/, '');
            const nuevoCodigo = datosPais ? datosPais.codigo : "+57";

            return {
                ...prev,
                pais: paisSeleccionado,
                ciudad: datosPais?.ciudades[0] || "",
                // Actualiza el prefijo telefónico conservando los números ingresados
                telefono: `${nuevoCodigo} ${numeroLimpio}`.trim()
            };
        });
    };
    const handleSubmit = async () => {
        setMensajeExito(null);

        if (!formData.nombres.trim() || !formData.apellidos.trim()) {
            showToast('warning', '¡Campo obligatorio! Debes ingresar tu nombre y apellidos completos');
            return;
        }

        if (!formData.email.trim()) {
            showToast('warning', 'El correo electrónico es obligatorio');
            return;
        }

        if (!formData.enlaceCv || formData.enlaceCv.trim() === '') {
            showToast('warning', '¡Campo obligatorio! Debes ingresar la URL de la CV en PDF');
            return;
        }

        if (!formData.perfilLinkedin || formData.perfilLinkedin.trim() === '') {
            showToast('warning', '¡Campo obligatorio! Debes ingresar la URL de tu perfil de LinkedIn');
            return;
        }

        setLoading(true);

        try {
            const resCheck = await fetch('/api/postulantes');
            if (resCheck.ok) {
                const dataCheck = await resCheck.json();
                const existeCorreo = Array.isArray(dataCheck.postulantes) && dataCheck.postulantes.some(
                    (p: { email?: string }) => p.email?.toLowerCase().trim() === formData.email.toLowerCase().trim()
                );

                if (existeCorreo) {
                    showToast('error', `El correo "${formData.email}" ya está registrado en el sistema BUK ATS. Debe ser único.`);
                    setLoading(false);
                    return;
                }
            }

            const res = await fetch('/api/postulantes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                setMensajeExito(`¡Postulación de ${formData.nombres} ${formData.apellidos} enviada automáticamente a BUK!`);
                showToast('success', `¡Postulación de ${formData.nombres} ${formData.apellidos} enviada correctamente!`);
                setFormData(initialFormData);

                await cargarPostulantesRecientes();
            } else {
                showToast('error', data.message || 'Error al enviar la postulación');
            }
        } catch (error) {
            showToast('error', 'Error de conexión con el middleware');
        } finally {
            setLoading(false);
        }
    };

    const inputClasses = "w-full bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-buk-text focus:outline-none focus:border-buk-primary focus:ring-2 focus:ring-buk-primary/10 transition placeholder:text-gray-400";
    const labelClasses = "block text-xs font-semibold text-buk-text-secondary mb-1.5 uppercase tracking-wider";

    return (
        <div className="flex flex-col lg:flex-row bg-[#F8FAFC] min-h-screen w-full">
            {/* CONTENEDOR IZQUIERDO: Formulario principal */}
            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-8 sm:pb-12">
                {/* Breadcrumb + título (Ajustado con pt-12 para dar espacio al menú hamburguesa en móviles) */}
                <div className="px-4 sm:px-6 py-4 pt-12 sm:pt-6 bg-white border-b border-buk-border">
                    <div className="flex items-center gap-2 mb-2 text-xs text-buk-text-secondary overflow-x-auto pb-1">
                        <Link href={ROUTES.ATS_BUK} className="hover:text-buk-primary transition whitespace-nowrap">
                            Selección
                        </Link>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" className="flex-shrink-0">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                        <span className="text-buk-text font-medium whitespace-nowrap">Simulador de Postulación</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start sm:items-center gap-3">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#0A66C2] flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-sm flex-shrink-0 mt-0.5 sm:mt-0">
                                in
                            </div>
                            <div>
                                <h1 className="text-sm sm:text-base md:text-lg font-bold text-buk-text leading-tight">
                                    Simulador de Webhook / Postulación LinkedIn
                                </h1>
                                <p className="text-[10px] sm:text-[11px] md:text-xs text-buk-text-secondary mt-0.5">
                                    Genera el evento JSON de origen que procesa el Middleware → BUK ATS
                                </p>
                            </div>
                        </div>
                        <Link
                            href={ROUTES.ATS_BUK}
                            className="self-start md:self-auto border border-buk-border text-buk-text-secondary text-xs px-3.5 py-2 rounded-lg hover:bg-gray-50 transition font-medium flex items-center gap-1.5 whitespace-nowrap bg-white shadow-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                            Volver al Panel ATS
                        </Link>
                    </div>
                </div>

                {/* Formulario */}
                <div className="px-4 sm:px-6 py-4 sm:py-6 max-w-2xl mx-auto w-full">
                    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-buk-border shadow-sm">
                        {/* Indicador de flujo */}
                        <div className="flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2 mb-6 pb-4 border-b border-gray-100 overflow-x-auto">
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#0A66C2] flex items-center justify-center text-white text-[9px] sm:text-[10px] font-bold">in</div>
                                <span className="text-[11px] sm:text-xs text-buk-text-secondary">LinkedIn</span>
                            </div>

                            <div className="flex-1 min-w-[20px] h-px bg-gray-200 relative mx-1">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
                                        <path d="M5 12h14" />
                                        <path d="m12 5 7 7-7 7" />
                                    </svg>
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                                <span className="text-[11px] sm:text-xs text-buk-text-secondary font-medium">Middleware</span>
                            </div>

                            <div className="flex-1 min-w-[20px] h-px bg-gray-200 relative mx-1">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
                                        <path d="M5 12h14" />
                                        <path d="m12 5 7 7-7 7" />
                                    </svg>
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-buk-success flex items-center justify-center text-white text-[9px] sm:text-[10px] font-bold">B</div>
                                <span className="text-[11px] sm:text-xs text-buk-text-secondary">BUK ATS</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* NOMBRES Y APELLIDOS */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClasses}>Nombres *</label>
                                    <input
                                        type="text"
                                        name="nombres"
                                        value={formData.nombres}
                                        onChange={handleChange}
                                        placeholder="Ej: Juan Carlos"
                                        className={inputClasses}
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>Apellidos *</label>
                                    <input
                                        type="text"
                                        name="apellidos"
                                        value={formData.apellidos}
                                        onChange={handleChange}
                                        placeholder="Ej: Pérez García"
                                        className={inputClasses}
                                    />
                                </div>
                            </div>

                            {/* EMAIL */}
                            <div>
                                <label className={labelClasses}>Correo Electrónico (Llave única) *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="correo@ejemplo.com"
                                    className={inputClasses}
                                />
                            </div>

                            {/* CELULAR Y VACANTE */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClasses}>Celular *</label>
                                    <input
                                        type="text"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleChange}
                                        placeholder="+57 300 000 0000"
                                        className={inputClasses}
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>ID Vacante (BUK) *</label>
                                    <input
                                        type="text"
                                        name="vacanteId"
                                        value={formData.vacanteId}
                                        onChange={handleChange}
                                        className={inputClasses}
                                    />
                                </div>
                            </div>

                            {/* PAÍS Y CIUDAD DINÁMICA */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClasses}>País *</label>
                                    <select
                                        name="pais"
                                        value={formData.pais}
                                        onChange={handleCountryChange}
                                        className={`${inputClasses} cursor-pointer`}
                                    >
                                        {Object.keys(datosPaises).map((nombrePais) => (
                                            <option key={nombrePais} value={nombrePais}>
                                                {nombrePais} ({datosPaises[nombrePais].codigo})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className={labelClasses}>Ciudad *</label>
                                    <select
                                        name="ciudad"
                                        value={formData.ciudad}
                                        onChange={handleChange}
                                        className={`${inputClasses} cursor-pointer`}
                                    >
                                        {(datosPaises[formData.pais]?.ciudades || []).map((ciudad) => (
                                            <option key={ciudad} value={ciudad}>
                                                {ciudad}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* CV Y LINKEDIN */}
                            <div>
                                <label className={labelClasses}>URL del CV en PDF *</label>
                                <input
                                    type="url"
                                    name="enlaceCv"
                                    value={formData.enlaceCv}
                                    onChange={handleChange}
                                    placeholder="https://ejemplo.com/mi-cv.pdf"
                                    className={inputClasses}
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>Perfil de LinkedIn *</label>
                                <input
                                    type="url"
                                    name="perfilLinkedin"
                                    value={formData.perfilLinkedin}
                                    onChange={handleChange}
                                    placeholder="https://linkedin.com/in/mi-perfil"
                                    className={inputClasses}
                                />
                            </div>

                            {/* BOTÓN DE ENVÍO */}
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full bg-buk-primary hover:bg-buk-primary-dark disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition text-sm shadow-sm mt-2 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Enviando a BUK por Middleware...
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M5 12h14" />
                                            <path d="m12 5 7 7-7 7" />
                                        </svg>
                                        Simular Clic de Postulación en LinkedIn
                                    </>
                                )}
                            </button>

                            {mensajeExito && (
                                <div className="mt-3 bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 sm:p-4 rounded-xl text-xs sm:text-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                                    <div className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                            <polyline points="22 4 12 14.01 9 11.01" />
                                        </svg>
                                        <span>{mensajeExito}</span>
                                    </div>
                                    <Link href={ROUTES.ATS_BUK} className="text-buk-primary font-bold text-xs hover:underline whitespace-nowrap self-end sm:self-auto">
                                        Ver en BUK ATS →
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* SIDEBAR DERECHO: Postulantes en cola */}
            <aside className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-buk-border p-4 flex flex-col flex-shrink-0">
                <div className="border-b border-buk-border pb-3 mb-3">
                    <h3 className="text-xs font-bold text-buk-text uppercase tracking-wider">
                        Postulantes en Cola (Middleware)
                    </h3>
                    <p className="text-[11px] text-buk-text-secondary">Sincronizados en tiempo real</p>
                </div>

                <div className="space-y-2.5 overflow-y-auto flex-1 max-h-[400px] lg:max-h-none pr-1">
                    {postulantesRecientes.length === 0 ? (
                        <p className="text-xs text-buk-text-secondary italic text-center py-8 lg:py-12">
                            No hay postulaciones registradas en esta sesión.
                        </p>
                    ) : (
                        postulantesRecientes.map((p) => (
                            <div key={p.id} className="bg-slate-50 border border-buk-border p-3 rounded-xl space-y-2 shadow-sm">
                                <div className="space-y-0.5">
                                    <p className="text-xs font-semibold text-buk-text">
                                        {p.nombres} {p.apellidos || ''}
                                    </p>
                                    <p className="text-[10px] text-buk-text-secondary font-mono truncate">{p.email}</p>
                                    <p className="text-[10px] text-buk-text-secondary font-mono truncate">{p.telefono}</p>
                                    <p className="text-[10px] text-buk-text-secondary font-mono truncate">{p.pais} - {p.ciudad}</p>
                                </div>

                                <button
                                    onClick={async () => {
                                        await fetch('/api/postulantes', {
                                            method: 'PUT',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ id: p.id, nuevoEstado: 'postulantes' })
                                        });
                                        window.location.href = ROUTES.ATS_BUK;
                                    }}
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] py-1.5 px-3 rounded-lg font-medium transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                                >
                                    <span>Mandarlo a BUK ATS →</span>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </aside>
        </div>
    );
}