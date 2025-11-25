'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Send, Mic, Plane, BookOpen, Zap, CheckCircle, Globe, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function HomePage() {
  const t = useTranslations('HomePage');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [query, setQuery] = useState('');
  const [jurisdiction, setJurisdiction] = useState<'ICAO' | 'ARG'>(locale === 'es' ? 'ARG' : 'ICAO');
  const [response, setResponse] = useState<null | {
    text: string;
    sources: Array<{ source: string; section?: string; preview?: string; score?: number }>;
    source?: string
  }>(null);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          locale: t.raw('title') === 'OACI.ai' ? 'en' : 'es',
          jurisdiction
        })
      });

      const data = await res.json();

      if (res.ok) {
        setResponse({
          text: data.text,
          sources: data.sources || [],
          source: data.source
        });
      } else {
        setResponse({
          text: "Error: " + (data.error || "Failed to connect to OACI Brain."),
          sources: [],
          source: "System"
        });
      }
    } catch (err) {
      setResponse({
        text: "Connection Error. Please check your internet.",
        sources: [],
        source: "System"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice input is not supported in this browser.');
      return;
    }

    // @ts-ignore
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = locale === 'es' ? 'es-ES' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setIsListening(false);
      // Optional: Auto-submit after voice input
      // handleSearch({ preventDefault: () => {} } as React.FormEvent);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-cyan-500/30">
      {/* ... (Header remains same) ... */}
      <header className="w-full max-w-6xl mx-auto p-6 flex justify-between items-center border-b border-zinc-900/50 sticky top-0 bg-black/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          {/* <Plane className="w-5 h-5 text-cyan-500" /> */}
          {/* <h1 className="text-xl font-bold tracking-tight text-white">OACI.ai</h1> */}
          <img src="/logo.png" alt="OACI.ai" className="h-12 w-auto object-contain" />
        </div>

        <div className="flex items-center gap-4">
          {/* Jurisdiction Selector */}
          <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
            <button
              onClick={() => router.push('/es')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${jurisdiction === 'ARG'
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                : 'text-zinc-400 hover:text-white'
                }`}
            >
              🇦🇷 ARG
            </button>
            <button
              onClick={() => router.push('/en')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${jurisdiction === 'ICAO'
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                : 'text-zinc-400 hover:text-white'
                }`}
            >
              🌍 ICAO
            </button>
          </div>
        </div>
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

                <div className="mb-6 flex items-start gap-3">
                  <div className="p-2 bg-cyan-500/10 rounded-lg shrink-0">
                    <BookOpen className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="prose prose-invert max-w-none w-full text-zinc-200 leading-relaxed">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        // Headings
                        h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-white mt-6 mb-4" {...props} />,
                        h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-white mt-5 mb-3" {...props} />,
                        h3: ({ node, ...props }) => <h3 className="text-lg font-semibold text-white mt-4 mb-2" {...props} />,
                        // Paragraphs
                        p: ({ node, ...props }) => <p className="text-zinc-200 mb-4 leading-relaxed" {...props} />,
                        // Strong/Bold
                        strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
                        // Em/Italic
                        em: ({ node, ...props }) => <em className="italic text-cyan-300" {...props} />,
                        // Lists
                        ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 space-y-2 text-zinc-200" {...props} />,
                        ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4 space-y-2 text-zinc-200" {...props} />,
                        li: ({ node, ...props }) => <li className="text-zinc-200" {...props} />,
                        // Code
                        code: ({ node, inline, ...props }: any) =>
                          inline
                            ? <code className="bg-zinc-800 text-cyan-400 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
                            : <code className="block bg-zinc-800 text-cyan-400 p-3 rounded-lg text-sm font-mono overflow-x-auto mb-4" {...props} />,
                        // Links
                        a: ({ node, ...props }) => <a className="text-cyan-400 hover:text-cyan-300 underline" {...props} />,
                        // Blockquotes
                        blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-cyan-500 pl-4 italic text-zinc-300 my-4" {...props} />,
                      }}
                    >
                      {response.text}
                    </ReactMarkdown>
                  </div>
                </div>

                {/* Sources Section */}
                {response.sources && response.sources.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-zinc-800/50">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      {t('source') || 'Verified Sources'}
                    </h4>
                    <div className="grid gap-2">
                      {response.sources.map((src, idx) => (
                        <div key={idx} className="bg-black/40 border border-zinc-800 rounded-lg p-3 flex items-center justify-between hover:border-cyan-500/30 transition-colors group/source">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-cyan-400">
                              {src.source.replace('.json', '').replace(/-/g, ' ').replace('icao doc', 'ICAO Doc').toUpperCase()}
                            </span>
                            {src.section && (
                              <span className="text-xs text-zinc-500">
                                Section {src.section}
                              </span>
                            )}
                          </div>
                          {src.score && (
                            <div className="flex items-center gap-1" title="Relevance Score">
                              <div className="h-1.5 w-16 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-cyan-500/50 rounded-full"
                                  style={{ width: `${(src.score || 0) * 100}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-zinc-600 font-mono">
                                {Math.round((src.score || 0) * 100)}%
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(!response.sources || response.sources.length === 0) && response.source && (
                  <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500 uppercase tracking-wider">
                    <span>Source</span>
                    <span className="text-cyan-400 font-mono bg-cyan-950/30 px-2 py-1 rounded">
                      {response.source}
                    </span>
                  </div>
                )}
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
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`p-3 transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-zinc-500 hover:text-white'}`}
              >
                <Mic className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isListening ? (locale === 'es' ? 'Escuchando...' : 'Listening...') : t('placeholder')}
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
