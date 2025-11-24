'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Send, Mic, Plane, BookOpen, Zap, CheckCircle, Globe, Shield } from 'lucide-react';
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

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, locale: t.raw('title') === 'OACI.ai' ? 'en' : 'es' })
      });

      const data = await res.json();

      if (res.ok) {
        setResponse({
          text: data.text,
          source: data.source || "AI Generated"
        });
      } else {
        setResponse({
          text: "Error: " + (data.error || "Failed to connect to OACI Brain."),
          source: "System"
        });
      }
    } catch (err) {
      setResponse({
        text: "Connection Error. Please check your internet.",
        source: "System"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-cyan-500/30">
      {/* Header */}
      <header className="w-full max-w-6xl mx-auto p-6 flex justify-between items-center border-b border-zinc-900/50 sticky top-0 bg-black/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <Plane className="w-5 h-5 text-cyan-500" />
          <h1 className="text-xl font-bold tracking-tight text-white">OACI.ai</h1>
        </div>
        <LanguageSwitcher />
      </header>

      {/* Hero Section (The Black Box) */}
      <section className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-3xl mx-auto min-h-[80vh]">
        <AnimatePresence mode="wait">
          {!response && !loading ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-6 mb-12"
            >
              <h2 className="text-5xl md:text-7xl font-bold bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent tracking-tighter">
                {t('subtitle')}
              </h2>
              <p className="text-zinc-400 text-xl max-w-2xl mx-auto leading-relaxed">
                {t('hero_desc')}
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
                className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-zinc-600 px-2 py-2 text-lg outline-none"
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
              {t('disclaimer')}
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-white mb-4">{t('features.title')}</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-amber-400" />}
              title={t('features.speed.title')}
              desc={t('features.speed.desc')}
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6 text-cyan-400" />}
              title={t('features.accuracy.title')}
              desc={t('features.accuracy.desc')}
            />
            <FeatureCard
              icon={<Globe className="w-6 h-6 text-emerald-400" />}
              title={t('features.bilingual.title')}
              desc={t('features.bilingual.desc')}
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-black border-t border-zinc-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-white mb-4">{t('pricing.title')}</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="p-8 rounded-3xl border border-zinc-800 bg-zinc-900/20 hover:border-zinc-700 transition-colors">
              <h4 className="text-xl font-semibold text-zinc-400 mb-2">{t('pricing.free.title')}</h4>
              <div className="text-4xl font-bold text-white mb-6">{t('pricing.free.price')}</div>
              <ul className="space-y-4 mb-8">
                {/* @ts-ignore */}
                {t.raw('pricing.free.features').map((feature: string, i: number) => (
                  <li key={i} className="flex items-center gap-3 text-zinc-300">
                    <CheckCircle className="w-5 h-5 text-zinc-600" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 rounded-xl border border-zinc-700 text-white hover:bg-zinc-800 transition-colors font-medium">
                {t('cta.button')}
              </button>
            </div>

            {/* Pro Plan */}
            <div className="p-8 rounded-3xl border border-cyan-500/30 bg-cyan-950/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-cyan-500 text-black text-xs font-bold px-3 py-1 rounded-bl-xl">
                RECOMMENDED
              </div>
              <h4 className="text-xl font-semibold text-cyan-400 mb-2">{t('pricing.pro.title')}</h4>
              <div className="text-4xl font-bold text-white mb-6">{t('pricing.pro.price')}</div>
              <ul className="space-y-4 mb-8">
                {/* @ts-ignore */}
                {t.raw('pricing.pro.features').map((feature: string, i: number) => (
                  <li key={i} className="flex items-center gap-3 text-zinc-200">
                    <CheckCircle className="w-5 h-5 text-cyan-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 rounded-xl bg-cyan-500 text-black hover:bg-cyan-400 transition-colors font-bold shadow-lg shadow-cyan-500/20">
                {t('cta.button')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-900 text-center text-zinc-600 text-sm">
        <p>© 2025 OACI.ai. Built for the skies.</p>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors">
      <div className="mb-4">{icon}</div>
      <h4 className="text-lg font-semibold text-white mb-2">{title}</h4>
      <p className="text-zinc-400 leading-relaxed">{desc}</p>
    </div>
  );
}
