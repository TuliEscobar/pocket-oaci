'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Send, Mic, Plane, BookOpen, Zap, CheckCircle, Globe, Shield, ArrowRight, Linkedin, Twitter, Mail, Building, GraduationCap, Radio, Wrench, Briefcase, Activity, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, useClerk, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DocumentTicker from '@/components/DocumentTicker';

export default function HomePage() {
  const t = useTranslations('HomePage');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const { isSignedIn, user } = useUser();
  const { openSignIn } = useClerk();

  const [query, setQuery] = useState('');
  const [jurisdiction, setJurisdiction] = useState<'ICAO' | 'ARG'>(locale === 'es' ? 'ARG' : 'ICAO');
  const [response, setResponse] = useState<null | {
    text: string;
    sources: Array<{ source: string; section?: string; preview?: string; score?: number }>;
    source?: string
  }>(null);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);

  useEffect(() => {
    if (isSignedIn && user) {
      // Check if user has a plan selected
      const hasPlan = user.publicMetadata?.plan;
      if (!hasPlan) {
        setShowPlanModal(true);
      }
    }
  }, [isSignedIn, user]);

  const handleSelectPlan = async (plan: 'free' | 'pro') => {
    try {
      const res = await fetch('/api/user/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      });

      if (res.ok) {
        // Reload to update user metadata in the client
        window.location.reload();
      } else {
        console.error("Failed to set plan");
      }
    } catch (error) {
      console.error("Error setting plan:", error);
    }
  };

  const [hasUsedFreeQuery, setHasUsedFreeQuery] = useState(false);

  useEffect(() => {
    const used = localStorage.getItem('oaci_free_query_used');
    if (used) setHasUsedFreeQuery(true);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (!isSignedIn) {
      if (hasUsedFreeQuery) {
        openSignIn();
        return;
      }
      // Allow one free query
    }

    setLoading(true);
    // Initialize response with empty text to show the UI immediately
    setResponse({
      text: "",
      sources: [],
      source: "Thinking..."
    });

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

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to connect to OACI Brain.");
      }

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // Keep the last line in buffer if it's not empty (incomplete)
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            if (data.type === 'metadata') {
              setResponse(prev => ({
                text: prev?.text || "",
                sources: data.sources,
                source: data.source
              }));
            } else if (data.type === 'chunk') {
              setResponse(prev => ({
                text: (prev?.text || "") + data.text,
                sources: prev?.sources || [],
                source: prev?.source
              }));
            }
          } catch (e) {
            console.error("Error parsing JSON chunk", e);
          }
        }
      }

    } catch (err: any) {
      console.error(err);
      setResponse({
        text: `Error: ${err.message || "Connection Error. Please check your internet."}`,
        sources: [],
        source: "System"
      });
    } finally {
      setLoading(false);
      if (!isSignedIn) {
        setHasUsedFreeQuery(true);
        localStorage.setItem('oaci_free_query_used', 'true');
      }
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
        <div className="flex items-center gap-3">
          {/* <Plane className="w-5 h-5 text-cyan-500" /> */}
          {/* <h1 className="text-xl font-bold tracking-tight text-white">OACI.ai</h1> */}
          <img src="/logo.png" alt="OACI.ai" className="h-12 w-auto object-contain" />
          <h1 className="text-xl font-bold tracking-tight text-white">OACI.ai</h1>
          <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-wider">
            {t('beta_badge')}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6 mr-4">
            <a href="#home" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">{t('nav.home')}</a>
            <a href="#chat" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">{t('nav.chat')}</a>
            <a href="#pricing" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">{t('nav.pricing')}</a>
            <a href="#about" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">{t('nav.about')}</a>
            <a href="#faq" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">{t('nav.faq')}</a>
          </nav>

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

          <SignedOut>
            <SignInButton mode="modal">
              <button className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-cyan-500/20">
                {locale === 'es' ? 'Registrarme' : 'Sign In'}
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10 border-2 border-cyan-500/50 hover:border-cyan-500 transition-colors",
                  userButtonPopoverCard: "bg-zinc-900 border border-zinc-800 shadow-2xl shadow-cyan-500/10",
                  userButtonPopoverActionButton: "text-white hover:bg-zinc-800",
                  userButtonPopoverActionButtonText: "text-white",
                  userButtonPopoverFooter: "hidden",
                }
              }}
            />
          </SignedIn>
        </div>
      </header>

      <DocumentTicker />

      {/* Hero Section (The Black Box) */}
      <section id="home" className="relative flex-1 flex flex-col items-center justify-center p-6 w-full max-w-3xl mx-auto min-h-[80vh] overflow-hidden">
        {/* Modern Radar/Swish Effect */}
        <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="relative w-[600px] h-[600px] md:w-[800px] md:h-[800px]"
          >
            <div className="absolute inset-0 bg-cyan-500/5 rounded-full blur-[100px]" />
            <motion.div
              animate={{ rotate: [90, 450] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(6,182,212,0.1)_60deg,transparent_100deg)]"
            />

            {/* Radar Blips (Aircraft) - Synchronized 4s Cycle / Start 90deg */}
            {[
              { angle: 45, radius: 25, delay: 3.5 },   // (45-90+360)/360 * 4 = 3.5s
              { angle: 135, radius: 35, delay: 0.5 },  // (135-90)/360 * 4 = 0.5s
              { angle: 225, radius: 20, delay: 1.5 },  // (225-90)/360 * 4 = 1.5s
              { angle: 315, radius: 40, delay: 2.5 },  // (315-90)/360 * 4 = 2.5s
              { angle: 0, radius: 15, delay: 3.0 },    // (0-90+360)/360 * 4 = 3.0s
              { angle: 90, radius: 42, delay: 0 },     // Start point = 0s
            ].map((blip, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                style={{
                  top: `${50 - blip.radius * Math.cos(blip.angle * Math.PI / 180)}%`,
                  left: `${50 + blip.radius * Math.sin(blip.angle * Math.PI / 180)}%`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.5, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: blip.delay,
                  repeatDelay: 2.5, // 4s cycle - 1.5s duration
                  ease: "easeOut",
                }}
              />
            ))}
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {!response && !loading ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative z-10 text-center space-y-6 mb-12 flex flex-col items-center"
            >
              <h2 className="text-5xl md:text-7xl font-bold bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent tracking-tighter">
                {t('subtitle')}
              </h2>
              <p className="text-zinc-400 text-xl max-w-2xl mx-auto leading-relaxed">
                {t('hero_desc')}
              </p>

              {!isSignedIn && (
                <Link
                  href={`/${locale}/waitlist`}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full font-bold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-cyan-500/20 mt-4"
                >
                  {t('cta.button') || 'Join Waitlist'}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              )}
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
                {response.sources && response.sources.length > 0 && (() => {
                  // Group sources by document name
                  const groupedSources = response.sources.reduce((acc: any, src: any) => {
                    const docName = src.source.replace('.json', '').replace(/-/g, ' ').replace('icao doc', 'ICAO Doc').toUpperCase();
                    if (!acc[docName]) {
                      acc[docName] = {
                        name: docName,
                        sections: [],
                        avgScore: 0,
                        count: 0
                      };
                    }
                    acc[docName].sections.push(src.section);
                    acc[docName].avgScore += src.score || 0;
                    acc[docName].count += 1;
                    return acc;
                  }, {});

                  // Calculate average scores
                  Object.values(groupedSources).forEach((doc: any) => {
                    doc.avgScore = doc.avgScore / doc.count;
                  });

                  const uniqueDocs = Object.values(groupedSources);

                  return (
                    <div className="mt-6 pt-6 border-t border-zinc-800/50">
                      <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <CheckCircle className="w-3 h-3" />
                        {t('source') || 'Verified Sources'} ({uniqueDocs.length} {uniqueDocs.length === 1 ? 'document' : 'documents'})
                      </h4>
                      <div className="grid gap-3">
                        {uniqueDocs.map((doc: any, idx: number) => (
                          <div
                            key={idx}
                            className="group relative bg-gradient-to-br from-zinc-900/80 to-black/60 border border-zinc-800 rounded-xl p-4 hover:border-cyan-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
                          >
                            {/* Glow effect on hover */}
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />

                            <div className="relative flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                {/* Document name */}
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 group-hover:animate-pulse" />
                                  <h5 className="text-sm font-bold text-cyan-400 group-hover:text-cyan-300 transition-colors">
                                    {doc.name}
                                  </h5>
                                </div>

                                {/* Sections info */}
                                <div className="flex items-center gap-3 text-xs text-zinc-500">
                                  <span className="flex items-center gap-1.5">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    {doc.count} {doc.count === 1 ? 'reference' : 'references'}
                                  </span>
                                  {doc.sections.filter((s: any) => s).length > 0 && (
                                    <span className="flex items-center gap-1.5">
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                      </svg>
                                      {doc.sections.filter((s: any) => s).length} {doc.sections.filter((s: any) => s).length === 1 ? 'section' : 'sections'}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Relevance score */}
                              <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-2">
                                  <div className="h-1.5 w-20 bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                                      style={{ width: `${(doc.avgScore || 0) * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-[10px] text-zinc-600 font-mono font-bold min-w-[32px] text-right">
                                    {Math.round((doc.avgScore || 0) * 100)}%
                                  </span>
                                </div>
                                <span className="text-[9px] text-zinc-600 uppercase tracking-wider">relevance</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}


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
        <div id="chat" className="w-full relative z-10 scroll-mt-32">
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
            <div className="relative bg-black rounded-2xl flex items-start p-2 border border-zinc-800 focus-within:border-zinc-700 transition-colors">
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`p-3 transition-colors shrink-0 ${isListening ? 'text-red-500 animate-pulse' : 'text-zinc-500 hover:text-white'}`}
              >
                <Mic className="w-5 h-5" />
              </button>
              <textarea
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  // Auto-resize textarea
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                onKeyDown={(e) => {
                  // Submit on Enter (without Shift)
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSearch(e as any);
                  }
                }}
                placeholder={isListening ? (locale === 'es' ? 'Escuchando...' : 'Listening...') : t('placeholder')}
                className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-zinc-600 px-2 py-2 text-lg outline-none resize-none overflow-hidden min-h-[40px] max-h-[200px]"
                rows={1}
              />
              <button
                type="submit"
                disabled={!query.trim() || loading}
                className="p-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
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

      {/* Social Proof Section */}
      <section className="py-12 bg-zinc-950/50 border-y border-zinc-900">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-center text-zinc-500 text-sm font-medium uppercase tracking-wider mb-8">
            {t('SocialProof.title')}
          </h3>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 items-center">
            <div className="flex items-center gap-2 text-zinc-400 hover:text-zinc-300 transition-colors">
              <Plane className="w-5 h-5" />
              <span className="text-sm">{t('SocialProof.roles.pilot')}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400 hover:text-zinc-300 transition-colors">
              <Radio className="w-5 h-5" />
              <span className="text-sm">{t('SocialProof.roles.atc')}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400 hover:text-zinc-300 transition-colors">
              <GraduationCap className="w-5 h-5" />
              <span className="text-sm">{t('SocialProof.roles.student')}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400 hover:text-zinc-300 transition-colors">
              <Wrench className="w-5 h-5" />
              <span className="text-sm">{t('SocialProof.roles.mechanic')}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400 hover:text-zinc-300 transition-colors">
              <BookOpen className="w-5 h-5" />
              <span className="text-sm">{t('SocialProof.roles.instructor')}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400 hover:text-zinc-300 transition-colors">
              <Building className="w-5 h-5" />
              <span className="text-sm">{t('SocialProof.roles.school')}</span>
            </div>
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

      {/* Use Cases Section */}
      <section className="py-24 bg-black">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-16">{t('UseCases.title')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-cyan-500/30 transition-all group"
            >
              <GraduationCap className="w-10 h-10 text-cyan-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-2">{t('UseCases.student.title')}</h3>
              <p className="text-zinc-400">{t('UseCases.student.desc')}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-cyan-500/30 transition-all group"
            >
              <Plane className="w-10 h-10 text-cyan-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-2">{t('UseCases.pro.title')}</h3>
              <p className="text-zinc-400">{t('UseCases.pro.desc')}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-cyan-500/30 transition-all group"
            >
              <Activity className="w-10 h-10 text-cyan-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-2">{t('UseCases.ops.title')}</h3>
              <p className="text-zinc-400">{t('UseCases.ops.desc')}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-black border-t border-zinc-900 scroll-mt-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-white mb-4">{t('pricing.title')}</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
              <Link href={`/${locale}/waitlist`} className="block w-full py-3 rounded-xl border border-zinc-700 text-white hover:bg-zinc-800 transition-colors font-medium text-center">
                {t('cta.button')}
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="p-8 rounded-3xl border border-cyan-500/50 bg-gradient-to-b from-cyan-950/20 to-zinc-900/50 relative overflow-hidden shadow-2xl shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all transform hover:-translate-y-1">
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
              <Link href={`/${locale}/waitlist`} className="block w-full py-3 rounded-xl bg-cyan-500 text-black hover:bg-cyan-400 transition-colors font-bold shadow-lg shadow-cyan-500/20 text-center">
                {t('cta.button')}
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="p-8 rounded-3xl border border-zinc-800 bg-zinc-900/20 hover:border-zinc-700 transition-colors">
              <h4 className="text-xl font-semibold text-zinc-400 mb-2">{t('pricing.enterprise.title')}</h4>
              <div className="text-4xl font-bold text-white mb-6">{t('pricing.enterprise.price')}</div>
              <ul className="space-y-4 mb-8">
                {/* @ts-ignore */}
                {t.raw('pricing.enterprise.features').map((feature: string, i: number) => (
                  <li key={i} className="flex items-center gap-3 text-zinc-300">
                    <CheckCircle className="w-5 h-5 text-zinc-600" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href={`/${locale}/waitlist`} className="block w-full py-3 rounded-xl border border-zinc-700 text-white hover:bg-zinc-800 transition-colors font-medium text-center">
                {t('pricing.enterprise.cta')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="relative py-24 bg-zinc-950 border-t border-zinc-900 scroll-mt-28 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold text-white mb-8">{t('about.title')}</h3>
          <p className="text-xl text-zinc-300 mb-6 leading-relaxed">
            {t('about.mission')}
          </p>
          <p className="text-zinc-500 mb-8">
            {t('about.tech')}
          </p>
          <a href="mailto:consultas@oaci.ai" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
            <Mail className="w-5 h-5" />
            {t('about.contact')}
          </a>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-zinc-950 border-t border-zinc-900 scroll-mt-28">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">{t('FAQ.title')}</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <details key={i} className="group bg-zinc-900/30 rounded-xl border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-colors">
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-zinc-900/50 transition-colors list-none">
                  <span className="font-medium text-white pr-4">{t(`FAQ.q${i}.question`)}</span>
                  <ChevronDown className="w-5 h-5 text-zinc-500 group-open:rotate-180 transition-transform shrink-0" />
                </summary>
                <div className="px-6 pb-6 text-zinc-400 leading-relaxed">
                  {t(`FAQ.q${i}.answer`)}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-900 bg-black">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="OACI.ai" className="h-8 w-auto opacity-50 grayscale hover:grayscale-0 transition-all" />
            <span className="text-zinc-600 text-sm">{t('footer.copyright')}</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="#" className="text-zinc-600 hover:text-zinc-400 text-sm transition-colors">
              {t('footer.privacy')}
            </Link>
            <Link href="#" className="text-zinc-600 hover:text-zinc-400 text-sm transition-colors">
              {t('footer.terms')}
            </Link>
            <Link href="#faq" className="text-zinc-600 hover:text-zinc-400 text-sm transition-colors">
              FAQ
            </Link>
            <a
              href="https://www.linkedin.com/company/110325526/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-[#0A66C2] transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="https://x.com/OACI_ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-white transition-colors"
              aria-label="X (Twitter)"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="mailto:consultas@oaci.ai"
              className="text-zinc-500 hover:text-cyan-400 transition-colors"
              aria-label="Email"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </footer>

      {/* Plan Selection Modal */}
      <AnimatePresence>
        {showPlanModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">{t('PlanSelection.title')}</h2>
                <p className="text-zinc-400">{t('PlanSelection.subtitle')}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Free Option */}
                <button
                  onClick={() => handleSelectPlan('free')}
                  className="group p-6 rounded-2xl border border-zinc-800 bg-black/50 hover:border-zinc-600 transition-all text-left flex flex-col h-full"
                >
                  <div className="mb-4 p-3 bg-zinc-800 rounded-xl w-fit group-hover:bg-zinc-700 transition-colors">
                    <Plane className="w-6 h-6 text-zinc-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{t('pricing.free.title')}</h3>
                  <p className="text-zinc-400 font-medium mb-2">{t('PlanSelection.free.price')}</p>
                  <p className="text-zinc-500 text-sm mb-6 flex-1">{t('PlanSelection.free.description')}</p>
                  <div className="w-full py-2 rounded-lg bg-zinc-800 text-white text-center font-medium group-hover:bg-zinc-700 transition-colors">
                    {t('PlanSelection.free.button')}
                  </div>
                </button>

                {/* Pro Option */}
                <button
                  onClick={() => handleSelectPlan('pro')}
                  className="group p-6 rounded-2xl border border-cyan-500/30 bg-cyan-950/10 hover:border-cyan-500/60 transition-all text-left flex flex-col h-full relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 bg-cyan-500 text-black text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                    RECOMMENDED
                  </div>
                  <div className="mb-4 p-3 bg-cyan-500/20 rounded-xl w-fit group-hover:bg-cyan-500/30 transition-colors">
                    <Zap className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{t('pricing.pro.title')}</h3>
                  <p className="text-cyan-400 font-medium mb-2">{t('PlanSelection.pro.price')}</p>
                  <p className="text-cyan-200/60 text-sm mb-6 flex-1">{t('PlanSelection.pro.description')}</p>
                  <div className="w-full py-2 rounded-lg bg-cyan-500 text-black text-center font-bold shadow-lg shadow-cyan-500/20 group-hover:bg-cyan-400 transition-colors">
                    {t('PlanSelection.pro.button')}
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
