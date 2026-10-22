import { NextResponse } from 'next/server';

let postulantesEnBuk: any[] = [];

export async function GET() {
return NextResponse.json({ success: true, postulantes: postulantesEnBuk });
}

export async function POST(request: Request) {
try {
const body = await request.json();

// Extraer campos con valores por defecto si vienen vacíos
const nombres = body.nombres || 'Candidato';
const apellidos = body.apellidos || 'Sin Apellido';
const email = body.email;
const telefono = body.telefono || body.celular || 'Sin número';
const vacanteId = body.vacanteId || 'VAC-01';
const pais = body.pais || 'Colombia';
const ciudad = body.ciudad || 'Medellín';
const cvUrl = body.enlaceCv || body.cv_url || 'https://ejemplo.com/cv.pdf';
const perfilLinkedin = body.perfilLinkedin || 'No proporcionado';

// La única validación estricta será el correo
if (!email) {
    return NextResponse.json(
    { success: false, message: 'El correo electrónico es obligatorio (llave única)' },
    { status: 400 }
    );
}
const nuevoCandidatoBuk = {
    id: `BUK-AP-${Date.now().toString().slice(-4)}`,
    vacancy_id: vacanteId,
    nombres: nombres,
    apellidos: apellidos,
    email: email,
    telefono: telefono,
    pais: pais,
    ciudad: ciudad,
    cv_url: cvUrl,
    perfil_linkedin: perfilLinkedin,
    fuente_origen: "LinkedIn (Importadores Curriculum)",
    estado: "postulantes", // <--- CAMBIADO: Debe coincidir con el ID de la primera columna del Kanban
    fecha_postulacion: new Date().toISOString()
};
// Guardar en la Mock API en memoria
postulantesEnBuk.unshift(nuevoCandidatoBuk);

return NextResponse.json(
    {
    success: true,
    message: "¡Postulación procesada con éxito bajo el contrato Mock de BUK!",
    candidatoRegistrado: nuevoCandidatoBuk
    },
    { status: 201 }
);

} catch (error) {
return NextResponse.json(
    { success: false, message: "Error interno en la servidor middleware" },
    { status: 500 }
);
}
}