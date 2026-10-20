import { NextResponse } from 'next/server';

// "Base de datos" temporal en la memoria del servidor para simular a BUK
let postulantesEnBuk: any[] = [];

export async function GET() {
// Endpoint para que el frontend consulte qué candidatos ya están en BUK
return NextResponse.json({ success: true, postulantes: postulantesEnBuk });
}

export async function POST(request: Request) {
try {
const body = await request.json();

if (!body.email || !body.nombreCompleto || !body.vacanteId) {
    return NextResponse.json(
    { success: false, message: 'Faltan campos obligatorios' },
    { status: 400 }
    );
}

// 1. Transformar los datos como lo exigiría BUK
const nuevoCandidatoBuk = {
    id: `BUK-${Date.now().toString().slice(-4)}`,
    vacancy_id: body.vacanteId,
    nombre: body.nombreCompleto,
    email: body.email,
    telefono: body.telefono,
    cv_url: body.enlaceCv,
    perfil_linkedin: body.perfilLinkedin,
    estado: "Pendiente / En espera", // El estado que mencionaste al inicio
    fecha_postlucion: new Date().toISOString()
};

// 2. "Guardar" en el ATS simulado de BUK
postulantesEnBuk.unshift(nuevoCandidatoBuk); // Lo agrega al inicio de la lista

return NextResponse.json(
    {
    success: true,
    message: "¡Postulación recibida por el middleware y registrada con éxito en el ATS BUK (Mock)!",
    candidatoRegistrado: nuevoCandidatoBuk
    },
    { status: 201 }
);

} catch (error) {
return NextResponse.json(
    { success: false, message: "Error en el servidor middleware" },
    { status: 500 }
);
}
}