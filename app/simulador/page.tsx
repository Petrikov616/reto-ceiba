'use client';
import { ROUTES } from "@/app/constants/routes";
import { useState, ChangeEvent } from 'react';
import Link from 'next/link';

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

const paisesCeiba = [
    { nombre: 'Colombia', codigo: '+57' },
    { nombre: 'Estados Unidos', codigo: '+1' },
    { nombre: 'México', codigo: '+52' },
    { nombre: 'Panamá', codigo: '+507' },
    { nombre: 'República Dominicana', codigo: '+1' },
    { nombre: 'Ecuador', codigo: '+593' },
    { nombre: 'Perú', codigo: '+51' },
    { nombre: 'Canadá', codigo: '+1' },
    { nombre: 'España', codigo: '+34' },
];

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

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let updatedForm = { ...formData, [name]: value };

        if (name === 'telefono') {
            const paisEncontrado = paisesCeiba
                .slice()
                .sort((a, b) => b.codigo.length - a.codigo.length)
                .find(p => value.trim().startsWith(p.codigo));

            if (paisEncontrado) {
                updatedForm.pais = paisEncontrado.nombre;
            }
        }

        setFormData(updatedForm);
    };

    // Maneja cuando seleccionas manualmente el país desde el menú desplegable
    const handleCountryChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const paisSeleccionado = e.target.value;
        const encontrado = paisesCeiba.find(p => p.nombre === paisSeleccionado);

        setFormData({
            ...formData,
            pais: paisSeleccionado,
            telefono: encontrado ? encontrado.codigo : formData.telefono
        });
    };

    const handleSubmit = async () => {
        setMensajeExito(null);

        if( !formData.nombres.trim() || ! formData.apellidos.trim() ) {
            alert('!Campo obligatorio! Debes de ingresar tu nombre y apellidos completos');
            return;
        }

        if(!formData.email.trim()) {
            alert('El correo electrónica es obligatorio');
            return;
        }

        if(!formData.enlaceCv || formData.enlaceCv.trim() === '') {
            alert('!Campo obligatorio! Debes de ingresar la URL de la CV en PDF')
            return;
        }

        if( !formData.perfilLinkedin || formData.perfilLinkedin.trim() === '') {
            alert('!Campo obligatorio! Debes de ingresar la URL de tu perfil de LinkedIn')
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
                alert(` El correo "${formData.email}" ya está registrado en el sistema BUK ATS. Debe ser único.`);
                setLoading(false);
                return;
            }
        }

        // 3. Envío de la postulación
        const res = await fetch('/api/postulantes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await res.json();
        
        if (res.ok) {
            setMensajeExito(`¡Postulación de ${formData.nombres} ${formData.apellidos} enviada automáticamente a BUK!`);
            setFormData(initialFormData); 
        } else {
            alert(data.message || 'Error al enviar la postulación');
        }
    } catch (error) {
        alert('Error de conexión con el middleware');
    } finally {
        setLoading(false);
    }
};

    return (
        <main className="min-h-screen bg-slate-900 text-slate-100 p-8 flex flex-col items-center">
            <div className="max-w-2xl w-full">
                <header className="mb-6 border-b border-slate-800 pb-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-blue-400 flex items-center gap-2">
                            <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs">in</span>
                            Simulador de Webhook / Postulación LinkedIn
                        </h1>
                        <p className="text-xs text-slate-400">
                            Genera el evento JSON de origen que procesa el Middleware
                        </p>
                    </div>

                    <Link
                        href={ROUTES.ATS_BUK}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs px-3.5 py-2 rounded-lg transition">
                        ← Volver al BUK ATS
                    </Link>
                </header>

                <section className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Nombres *</label>
                                <input
                                    type="text"
                                    name="nombres"
                                    value={formData.nombres}
                                    onChange={handleChange}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Apellidos *</label>
                                <input
                                    type="text"
                                    name="apellidos"
                                    value={formData.apellidos}
                                    onChange={handleChange}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Correo Electrónico (Llave única) *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-white"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Celular *</label>
                                <input
                                    type="text"
                                    name="telefono"
                                    value={formData.telefono}
                                    onChange={handleChange}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">ID Vacante (BUK) *</label>
                                <input
                                    type="text"
                                    name="vacanteId"
                                    value={formData.vacanteId}
                                    onChange={handleChange}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-white"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">País *</label>
                                <select
                                    name="pais"
                                    value={formData.pais}
                                    onChange={handleCountryChange}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-white cursor-pointer"
                                >
                                    {paisesCeiba.map((p) => (
                                        <option key={p.nombre} value={p.nombre} className="bg-slate-900 text-white">
                                            {p.nombre} ({p.codigo})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Ciudad *</label>
                                <input
                                    type="text"
                                    name="ciudad"
                                    value={formData.ciudad}
                                    onChange={handleChange}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">URL del CV en PDF *</label>
                            <input
                                type="url"
                                name="enlaceCv"
                                value={formData.enlaceCv}
                                onChange={handleChange}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Perfil de LinkedIn</label>
                            <input
                                type="url"
                                name="perfilLinkedin"
                                value={formData.perfilLinkedin}
                                onChange={handleChange}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-white"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-medium py-2.5 px-4 rounded-lg transition text-sm shadow-md mt-4"
                        >
                            {loading ? 'Enviando a BUK por Middleware...' : ' Simular Clic de Postulación en LinkedIn'}
                        </button>

                        {mensajeExito && (
                            <div className="mt-4 bg-emerald-950 border border-emerald-700 text-emerald-300 p-3 rounded-lg text-xs flex justify-between items-center">
                                <span>{mensajeExito}</span>
                                <Link href={ROUTES.ATS_BUK} className="underline font-bold text-white ml-2">
                                    Ver en BUK ATS →
                                </Link>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}