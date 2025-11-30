import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verificar que el usuario tenga plan Pro
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('plan')
            .eq('id', userId)
            .single();

        if (userError || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.plan !== 'pro' && user.plan !== 'enterprise') {
            return NextResponse.json({
                error: 'Upgrade to Pro to upload custom documents'
            }, { status: 403 });
        }

        // Obtener el archivo del FormData
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validar tipo de archivo
        if (file.type !== 'application/pdf') {
            return NextResponse.json({
                error: 'Only PDF files are allowed'
            }, { status: 400 });
        }

        // Validar tamaño (máximo 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return NextResponse.json({
                error: 'File too large. Maximum size is 10MB'
            }, { status: 400 });
        }

        // Generar nombre único
        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `${userId}/${timestamp}_${sanitizedName}`;

        // Subir a Supabase Storage
        const fileBuffer = await file.arrayBuffer();
        const { error: uploadError } = await supabaseAdmin.storage
            .from('user_docs')
            .upload(filePath, fileBuffer, {
                contentType: 'application/pdf',
                upsert: false
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return NextResponse.json({
                error: 'Failed to upload file'
            }, { status: 500 });
        }

        // Registrar en la base de datos
        const { data: document, error: dbError } = await supabaseAdmin
            .from('user_documents')
            .insert({
                user_id: userId,
                filename: file.name,
                file_path: filePath,
                file_size: file.size,
                status: 'pending'
            })
            .select()
            .single();

        if (dbError) {
            console.error('Database error:', dbError);
            // Intentar eliminar el archivo subido
            await supabaseAdmin.storage.from('user_docs').remove([filePath]);
            return NextResponse.json({
                error: 'Failed to save document record'
            }, { status: 500 });
        }

        // TODO: Aquí iría el procesamiento del PDF (extracción, chunking, embeddings)
        // Por ahora solo lo guardamos

        return NextResponse.json({
            success: true,
            document: {
                id: document.id,
                filename: document.filename,
                status: document.status
            }
        });

    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json({
            error: error.message || 'Internal server error'
        }, { status: 500 });
    }
}

// Obtener documentos del usuario
export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: documents, error } = await supabaseAdmin
            .from('user_documents')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching documents:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ documents });

    } catch (error: any) {
        console.error('Error:', error);
        return NextResponse.json({
            error: error.message || 'Internal server error'
        }, { status: 500 });
    }
}
