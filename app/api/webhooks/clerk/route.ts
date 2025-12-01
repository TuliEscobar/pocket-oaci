import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
    console.log('🟢 Webhook endpoint hit!');

    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        console.error('❌ CLERK_WEBHOOK_SECRET is not set');
        return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    console.log('✅ Webhook secret found');

    // Get headers
    const headerPayload = await headers();
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');

    console.log('📋 Headers received:', {
        svix_id: svix_id ? 'present' : 'missing',
        svix_timestamp: svix_timestamp ? 'present' : 'missing',
        svix_signature: svix_signature ? 'present' : 'missing'
    });

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        console.error('❌ Missing svix headers');
        return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
    }

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    console.log('📦 Payload type:', payload.type);

    // Create a new Svix instance with your secret
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: any;

    // Verify the payload with the headers
    try {
        evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        }) as any;
        console.log('✅ Webhook signature verified');
    } catch (err: any) {
        console.error('❌ Webhook verification failed:', err.message);
        return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
    }

    // Process the webhook
    const { type, data } = evt;
    console.log(`📨 Webhook received: ${type}`);

    if (type === 'user.created') {
        const { id, email_addresses, created_at } = data;
        const email = email_addresses[0]?.email_address;

        console.log(`👤 Processing user: ${email} (${id})`);

        if (!email) {
            console.error('❌ No email found in user data');
            return NextResponse.json({ error: 'No email found' }, { status: 400 });
        }

        // Create user in Supabase
        console.log('💾 Attempting to save to Supabase...');
        const { error } = await supabaseAdmin
            .from('users')
            .insert({
                id,
                email,
                plan: 'free',
                created_at: new Date(created_at).toISOString()
            });

        if (error) {
            console.error('❌ Error creating user in Supabase:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        console.log(`✅ User synced to Supabase: ${email} (${id})`);
    }

    return NextResponse.json({ success: true });
}
