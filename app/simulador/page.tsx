'use client';

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

export default function SimuladorLinkedin() {
const [formData, setFormData] = useState<FormData>({
nombres: 'Samuel',
apellidos: 'Zuleta Hincapie',
email: 'hincapiezuleta813@gmail.com',
telefono: '+57 3167053203',
enlaceCv: 'https://ejemplo.com/cv-samuel.pdf',
vacanteId: 'VAC-3924',
perfilLinkedin: 'https://www.linkedin.com/in/samuel-zuleta-967516440/',
pais: 'Colombia',
ciudad: 'Medellín'
});

const [loading, setLoading] = useState<boolean>(false);
const [mensajeExito, setMensajeExito] = useState<string | null>(null);

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
    setMensajeExito(`¡Postulación de ${formData.nombres} ${formData.apellidos} enviada automáticamente a BUK!`);
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
        href="/" 
        className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs px-3.5 py-2 rounded-lg transition"
        >
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
            <input
                type="text"
                name="pais"
                value={formData.pais}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-white"
            />
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
            {loading ? 'Enviando a BUK por Middleware...' : '🚀 Simular Clic de Postulación en LinkedIn'}
        </button>

        {mensajeExito && (
            <div className="mt-4 bg-emerald-950 border border-emerald-700 text-emerald-300 p-3 rounded-lg text-xs flex justify-between items-center">
            <span>{mensajeExito}</span>
            <Link href="/" className="underline font-bold text-white ml-2">
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