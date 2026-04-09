import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: Request, { params }: { params: Promise<{ chatId: string }> }) {
    try {
        const { userId } = await auth();
        const { chatId } = await params;

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify chat belongs to user
        const { data: chat, error: chatError } = await supabaseAdmin
            .from('chats')
            .select('id')
            .eq('id', chatId)
            .eq('user_id', userId)
            .single();

        if (chatError || !chat) {
            return NextResponse.json({ error: 'Chat not found or unauthorized' }, { status: 404 });
        }

        // Fetch messages
        const { data: messages, error: messagesError } = await supabaseAdmin
            .from('messages')
            .select('*')
            .eq('chat_id', chatId)
            .order('created_at', { ascending: true });

        if (messagesError) {
            console.error('Error fetching messages:', messagesError);
            return NextResponse.json({ error: messagesError.message }, { status: 500 });
        }

        return NextResponse.json({ messages });
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
