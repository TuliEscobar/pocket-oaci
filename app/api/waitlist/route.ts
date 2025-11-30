import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            email,
            role,
            document,
            painPoint,
            company,
            companySize,
            useCase,
            customData,
            formType = 'individual' // Default to individual if not specified
        } = body;

        // Validación básica
        if (!email || !role) {
            return NextResponse.json(
                { error: 'Email y rol son requeridos' },
                { status: 400 }
            );
        }

        // Validar que empresa sea requerida para formType company
        if (formType === 'company' && !company) {
            return NextResponse.json(
                { error: 'Nombre de empresa es requerido' },
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

        // Seleccionar el webhook correcto según el tipo de formulario
        const webhookUrl = formType === 'company'
            ? process.env.GOOGLE_SHEETS_COMPANY_WEBHOOK_URL
            : process.env.GOOGLE_SHEETS_WEBHOOK_URL;

        if (!webhookUrl) {
            // Si no hay webhook configurado, solo logueamos los datos
            console.log(`⚠️ Webhook no configurado para tipo: ${formType}. Datos del registro:`);
            console.log({
                timestamp: new Date().toISOString(),
                formType,
                email,
                company: company || '',
                role,
                document: document || '',
                painPoint: painPoint || '',
                companySize: companySize || '',
                useCase: useCase || '',
                customData: customData || ''
            });

            return NextResponse.json(
                { success: true, message: 'Registro exitoso (modo desarrollo)' },
                { status: 200 }
            );
        }

        // Preparar datos según el tipo de formulario
        const dataToSend = formType === 'company'
            ? {
                email,
                company,
                role,
                companySize: companySize || '',
                useCase: useCase || '',
                customData: customData || '',
                painPoint: painPoint || '',
            }
            : {
                email,
                role,
                document: document || '',
                painPoint: painPoint || '',
            };

        // Enviar datos a Google Sheets
        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
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
