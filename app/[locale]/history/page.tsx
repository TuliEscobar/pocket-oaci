'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { MessageSquare, Calendar, ArrowRight, Loader2 } from 'lucide-react';

interface Chat {
    id: string;
    title: string;
    created_at: string;
    updated_at: string;
}

export default function HistoryPage() {
    const t = useTranslations('History'); // You'll need to add translations
    const router = useRouter();
    const { isLoaded, userId, getToken } = useAuth();
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isLoaded && !userId) {
            router.push('/');
            return;
        }

        if (userId) {
            fetchChats();
        }
    }, [isLoaded, userId]);

    const fetchChats = async () => {
        try {
            const res = await fetch('/api/chats');
            if (res.ok) {
                const data = await res.json();
                setChats(data.chats);
            }
        } catch (error) {
            console.error('Error fetching chats:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8 pt-24">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
                    Chat History
                </h1>

                {chats.length === 0 ? (
                    <div className="text-center text-gray-500 py-12">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No chat history found.</p>
                        <button
                            onClick={() => router.push('/')}
                            className="mt-4 text-cyan-400 hover:underline"
                        >
                            Start a new chat
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {chats.map((chat, index) => (
                            <motion.div
                                key={chat.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => router.push(`/?chatId=${chat.id}`)}
                                className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 hover:border-cyan-500/50 hover:bg-gray-900 transition-all cursor-pointer group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-cyan-900/20 group-hover:text-cyan-400 transition-colors">
                                            <MessageSquare className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-200 group-hover:text-white transition-colors line-clamp-1">
                                                {chat.title || 'Untitled Chat'}
                                            </h3>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(chat.created_at)}
                                            </div>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-cyan-400 transform group-hover:translate-x-1 transition-all" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
