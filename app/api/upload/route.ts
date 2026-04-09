import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is Pro
        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        const metadata = user.publicMetadata as { plan?: string };

        if (metadata.plan !== 'pro') {
            return NextResponse.json({ error: 'Pro plan required' }, { status: 403 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Supabase Storage
        const fileName = `${userId}/${Date.now()}-${file.name}`;

        // Ensure bucket exists (idempotent)
        // Note: Ideally buckets are created manually or via migration, but this is a fallback
        const { error: bucketError } = await supabaseAdmin.storage.createBucket('user-documents', {
            public: false,
            fileSizeLimit: 10485760, // 10MB
            allowedMimeTypes: ['application/pdf', 'image/png', 'image/jpeg']
        });

        if (bucketError && !bucketError.message.includes('already exists')) {
            console.error('Error creating bucket:', bucketError);
        }

        const { data: uploadData, error: uploadError } = await supabaseAdmin
            .storage
            .from('user-documents')
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: false
            });

        if (uploadError) {
            console.error('Error uploading file:', uploadError);
            return NextResponse.json({ error: uploadError.message }, { status: 500 });
        }

        // Save metadata to database
        const { error: dbError } = await supabaseAdmin
            .from('user_documents')
            .insert({
                user_id: userId,
                filename: file.name,
                file_url: uploadData.path,
                status: 'pending' // Pending processing
            });

        if (dbError) {
            console.error('Error saving metadata:', dbError);
            return NextResponse.json({ error: dbError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, path: uploadData.path });

    } catch (error: any) {
        console.error('Upload API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
