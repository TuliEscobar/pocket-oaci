import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, role, document, painPoint } = body;

        if (!email || !email.includes('@')) {
            return NextResponse.json(
                { error: "Email inválido" },
                { status: 400 }
            );
        }

        const leadsDir = path.join(process.cwd(), 'data');
        const leadsFile = path.join(leadsDir, 'leads.json');

        // Asegurar que el directorio existe
        if (!fs.existsSync(leadsDir)) {
            fs.mkdirSync(leadsDir, { recursive: true });
        }

        // Leer leads existentes
        let leads = [];
        if (fs.existsSync(leadsFile)) {
            const fileContent = fs.readFileSync(leadsFile, 'utf-8');
            try {
                leads = JSON.parse(fileContent);
            } catch (e) {
                leads = [];
            }
        }

        // Verificar duplicados
        if (leads.some((l: any) => l.email === email)) {
            return NextResponse.json(
                { message: "¡Ya estás en la lista! Te avisaremos pronto." },
                { status: 200 }
            );
        }

        // Agregar nuevo lead
        const newLead = {
            id: crypto.randomUUID(),
            email,
            role,
            document,
            painPoint,
            date: new Date().toISOString(),
            source: 'web_waitlist'
        };

        leads.push(newLead);

        // Guardar
        fs.writeFileSync(leadsFile, JSON.stringify(leads, null, 2));

        return NextResponse.json(
            { message: "¡Anotado! Bienvenido a bordo. ✈️" },
            { status: 201 }
        );

    } catch (error: any) {
        console.error('Waitlist Error:', error);
        return NextResponse.json(
            { error: "Error al guardar tu registro. Intenta de nuevo." },
            { status: 500 }
        );
    }
}
