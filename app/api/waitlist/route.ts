import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, role, document, painPoint } = body;

        // Validación básica
        if (!email || !role) {
            return NextResponse.json(
                { error: 'Email y rol son requeridos' },
                { status: 400 }
            );
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Email inválido' },
                { status: 400 }
            );
        }

        // Obtener la URL del webhook de Google Sheets desde las variables de entorno
        const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

        if (!webhookUrl) {
            // Si no hay webhook configurado, solo logueamos los datos
            console.log('⚠️ GOOGLE_SHEETS_WEBHOOK_URL no configurada. Datos del registro:');
            console.log({
                timestamp: new Date().toISOString(),
                email,
                role,
                document: document || '',
                painPoint: painPoint || ''
            });

            return NextResponse.json(
                { success: true, message: 'Registro exitoso (modo desarrollo)' },
                { status: 200 }
            );
        }

        // Enviar datos a Google Sheets
        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    role,
                    document: document || '',
                    painPoint: painPoint || '',
                }),
            });

            if (!response.ok) {
                console.error('Error al guardar en Google Sheets:', await response.text());
                // Aún así retornamos éxito para no bloquear al usuario
                return NextResponse.json(
                    { success: true, message: 'Registro recibido' },
                    { status: 200 }
                );
            }
        } catch (fetchError) {
            console.error('Error al conectar con Google Sheets:', fetchError);
            // Retornamos éxito de todas formas
            return NextResponse.json(
                { success: true, message: 'Registro recibido' },
                { status: 200 }
            );
        }

        return NextResponse.json(
            { success: true, message: 'Registro exitoso' },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error en /api/waitlist:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
