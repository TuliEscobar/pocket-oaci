'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, Plus, Trash2, Loader2, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface Chat {
    id: string;
    title: string;
    created_at: string;
}

interface ChatSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string | null | undefined;
    refreshTrigger?: number;
}

export default function ChatSidebar({ isOpen, onClose, userId, refreshTrigger = 0 }: ChatSidebarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentChatId = searchParams.get('chatId');
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (userId) {
            fetchChats();
        }
    }, [userId, refreshTrigger]);

    const fetchChats = async () => {
        try {
            setLoading(true);
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

    const handleNewChat = () => {
        router.push('/');
        onClose(); // On mobile, close sidebar
    };

    const handleSelectChat = (chatId: string) => {
        router.push(`/?chatId=${chatId}`);
        onClose();
    };

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.div
                className={`fixed top-0 left-0 h-full bg-zinc-950 border-r border-zinc-900 z-50 transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0 ${
                    isOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full md:w-0 md:translate-x-0 md:border-none'
                } md:relative md:h-screen`}
                initial={false}
            >
                <div className="p-4 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">History</h2>
                        <button onClick={onClose} className="md:hidden text-zinc-500 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <button
                        onClick={handleNewChat}
                        className="flex items-center gap-3 w-full px-4 py-3 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300 rounded-xl transition-all border border-cyan-500/20 mb-4 group"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                        <span className="font-semibold">New Chat</span>
                    </button>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {loading ? (
                            <div className="flex justify-center py-4">
                                <Loader2 className="w-5 h-5 animate-spin text-zinc-600" />
                            </div>
                        ) : chats.length === 0 ? (
                            <div className="text-center text-zinc-600 py-8 text-sm">
                                No chat history
                            </div>
                        ) : (
                            chats.map((chat) => (
                                <button
                                    key={chat.id}
                                    onClick={() => handleSelectChat(chat.id)}
                                    className={`w-full text-left p-3 rounded-lg text-sm transition-all group relative ${currentChatId === chat.id
                                        ? 'bg-zinc-800 text-white'
                                        : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <MessageSquare className="w-4 h-4 shrink-0 opacity-50" />
                                        <span className="truncate">{chat.title || 'Untitled Chat'}</span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </motion.div>
        </>
    );
}
