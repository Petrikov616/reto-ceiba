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

        // Validar que el correo sea obligatorio
        if (!email) {
            return NextResponse.json(
                { success: false, message: 'El correo electrónico es obligatorio (llave única)' },
                { status: 400 }
            );
        }

        const correoNormalizado = email.toLowerCase().trim();
        const existeCorreo = postulantesEnBuk.some(
            (p) => p.email && p.email.toLowerCase().trim() === correoNormalizado
        );

        if (existeCorreo) {
            return NextResponse.json(
                { success: false, message: ' Ya existe un postulante registrado con este correo electrónico en el sistema.' },
                { status: 409 } // Código 409: Conflicto por duplicidad
            );
        }

        const telefonoLimpio = telefono.trim();
        const exiteTelefono = postulantesEnBuk.some(
            (p) => p.telefono && p.telefono.trim() === telefonoLimpio
        );

        if (exiteTelefono) {
            return NextResponse.json(
                {success: false, message: ' Ya existe un postulante registrado con este telefono en el sistema.'},
                {status: 409}
            );
        }

        const nuevoPostulante = {
            ...body,
            id: Date.now(),
            estado: 'en_cola',
            createdAt: new Date().toISOString   
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
            estado: "en_cola", 
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
            { success: false, message: "Error interno en el servidor middleware" },
            { status: 500 }
        );
    }
}


export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, nuevoEstado } = body;

        // Buscar el postulante específico en el array global
        const index = postulantesEnBuk.findIndex((p: any) => String(p.id) === String(id));

        if (index !== -1) {
            // Actualizamos únicamente su estado sin alterar a los otros postulantes
            postulantesEnBuk[index].estado = nuevoEstado;

            return NextResponse.json({
                success: true,
                message: "Estado actualizado correctamente",
                postulante: postulantesEnBuk[index]
            });
        }

        return NextResponse.json({ success: false, message: "Postulante no encontrado" }, { status: 404 });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Error al actualizar" }, { status: 500 });
    }
}