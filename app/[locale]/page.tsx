'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Send, Mic, Plane, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function HomePage() {
  const t = useTranslations('HomePage');
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<null | { text: string; source: string }>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResponse(null);

    // Simulate AI delay
    setTimeout(() => {
      setResponse({
        text: t.raw('title') === 'OACI.ai'
          ? "Maximum holding speeds are: Up to 14,000ft (Cat A/B: 170kt, C/D/E: 230kt); Above 14,000ft to 20,000ft (240kt); Above 20,000ft to 34,000ft (265kt)."
          : "Las velocidades máximas de espera son: Hasta 14,000ft (Cat A/B: 170kt, C/D/E: 230kt); Sobre 14,000ft hasta 20,000ft (240kt); Sobre 20,000ft hasta 34,000ft (265kt).",
        source: "ICAO Doc 8168 (PANS-OPS), Vol I, Part II, Section 4, Chapter 1"
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-cyan-500/30">
      {/* Header */}
      <header className="w-full max-w-3xl mx-auto p-6 flex justify-between items-center border-b border-zinc-900/50">
        <div className="flex items-center gap-2">
          <Plane className="w-5 h-5 text-cyan-500" />
          <h1 className="text-xl font-bold tracking-tight text-white">OACI.ai</h1>
        </div>
        <LanguageSwitcher />
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-3xl mx-auto">

        <AnimatePresence mode="wait">
          {!response && !loading ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-4 mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
                {t('subtitle')}
              </h2>
              <p className="text-zinc-500 text-lg">
                {t('disclaimer')}
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Response Card */}
        <AnimatePresence>
          {response && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full mb-8"
            >
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-2xl shadow-cyan-500/5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-blue-600" />

                <div className="mb-4 flex items-start gap-3">
                  <div className="p-2 bg-cyan-500/10 rounded-lg">
                    <BookOpen className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-lg leading-relaxed text-zinc-200">
                      {response.text}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500 uppercase tracking-wider">
                  <span>{t('source')}</span>
                  <span className="text-cyan-400 font-mono bg-cyan-950/30 px-2 py-1 rounded">
                    {response.source}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {loading && (
          <div className="w-full mb-8 flex justify-center">
            <div className="flex items-center gap-2 text-cyan-500 animate-pulse">
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="w-full relative z-10">
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
            <div className="relative bg-black rounded-2xl flex items-center p-2 border border-zinc-800 focus-within:border-zinc-700 transition-colors">
              <button type="button" className="p-3 text-zinc-500 hover:text-white transition-colors">
                <Mic className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('placeholder')}
                className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-zinc-600 px-2 py-2 text-lg"
              />
              <button
                type="submit"
                disabled={!query.trim() || loading}
                className="p-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
          <div className="mt-4 text-center">
            <p className="text-xs text-zinc-700">
              AI can make mistakes. Check important info.
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
