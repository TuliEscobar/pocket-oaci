import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();
        const { type, data } = payload;

        // Solo procesamos eventos de creación de usuario
        if (type === 'user.created') {
            const { id, email_addresses, created_at } = data;
            const email = email_addresses[0]?.email_address;

            if (!email) {
                return NextResponse.json({ error: 'No email found' }, { status: 400 });
            }

            // Crear usuario en Supabase
            const { error } = await supabaseAdmin
                .from('users')
                .insert({
                    id,
                    email,
                    plan: 'free',
                    created_at: new Date(created_at).toISOString()
                });

            if (error) {
                console.error('Error creating user in Supabase:', error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            console.log(`✅ User ${email} synced to Supabase`);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
