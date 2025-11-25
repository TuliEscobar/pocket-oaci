'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Plane, CheckCircle, Zap, Users, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function WaitlistPage() {
    const t = useTranslations('Waitlist');
    const [formData, setFormData] = useState({
        email: '',
        role: '',
        document: '',
        painPoint: ''
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                setSubmitted(true);
            } else {
                setError(data.error || 'Error al enviar. Intenta de nuevo.');
            }
        } catch (err) {
            setError('Error de conexión. Verifica tu internet.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-black text-white flex flex-col font-sans">
            {/* Header */}
            <header className="w-full max-w-6xl mx-auto p-6 flex justify-between items-center border-b border-zinc-900/50">
                <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <Plane className="w-5 h-5 text-cyan-500" />
                    <h1 className="text-xl font-bold tracking-tight text-white">OACI.ai</h1>
                </Link>
            </header>

            <AnimatePresence mode="wait">
                {!submitted ? (
                    <motion.section
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-4xl mx-auto"
                    >
                        {/* Hero */}
                        <div className="text-center mb-12">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-block mb-4 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-sm font-medium"
                            >
                                {t('subtitle')}
                            </motion.div>
                            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent tracking-tighter mb-6">
                                {t('title')}
                            </h2>
                            <p className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">
                                {t('description')}
                            </p>
                        </div>

                        {/* Form */}
                        <div className="w-full max-w-xl">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 shadow-2xl shadow-cyan-500/5">
                                    {/* Email */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                                            {t('form.email')} <span className="text-cyan-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder={t('form.emailPlaceholder')}
                                            className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-colors"
                                        />
                                    </div>

                                    {/* Role */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                                            {t('form.role')} <span className="text-cyan-500">*</span>
                                        </label>
                                        <select
                                            required
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-colors"
                                        >
                                            <option value="">{t('form.rolePlaceholder')}</option>
                                            <option value="pilot_commercial">{t('form.roles.pilot_commercial')}</option>
                                            <option value="pilot_student">{t('form.roles.pilot_student')}</option>
                                            <option value="atc">{t('form.roles.atc')}</option>
                                            <option value="dispatcher">{t('form.roles.dispatcher')}</option>
                                            <option value="instructor">{t('form.roles.instructor')}</option>
                                            <option value="mechanic">{t('form.roles.mechanic')}</option>
                                            <option value="airport_ops">{t('form.roles.airport_ops')}</option>
                                            <option value="enthusiast">{t('form.roles.enthusiast')}</option>
                                            <option value="other">{t('form.roles.other')}</option>
                                        </select>
                                    </div>

                                    {/* Document */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                                            {t('form.document')}
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.document}
                                            onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                                            placeholder={t('form.documentPlaceholder')}
                                            className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-colors"
                                        />
                                    </div>

                                    {/* Pain Point */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                                            {t('form.painPoint')}
                                        </label>
                                        <textarea
                                            value={formData.painPoint}
                                            onChange={(e) => setFormData({ ...formData, painPoint: e.target.value })}
                                            placeholder={t('form.painPointPlaceholder')}
                                            rows={3}
                                            className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-colors resize-none"
                                        />
                                    </div>

                                    {/* Error */}
                                    {error && (
                                        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                            {error}
                                        </div>
                                    )}

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
                                    >
                                        {loading ? t('form.submitting') : t('form.submit')}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Benefits */}
                        <div className="mt-16 w-full max-w-4xl">
                            <h3 className="text-2xl font-bold text-center mb-8">{t('benefits.title')}</h3>
                            <div className="grid md:grid-cols-3 gap-6">
                                <BenefitCard
                                    icon={<Zap className="w-6 h-6 text-cyan-400" />}
                                    title={t('benefits.early_access.title')}
                                    desc={t('benefits.early_access.desc')}
                                />
                                <BenefitCard
                                    icon={<Users className="w-6 h-6 text-cyan-400" />}
                                    title={t('benefits.influence.title')}
                                    desc={t('benefits.influence.desc')}
                                />
                                <BenefitCard
                                    icon={<Gift className="w-6 h-6 text-cyan-400" />}
                                    title={t('benefits.free.title')}
                                    desc={t('benefits.free.desc')}
                                />
                            </div>
                        </div>
                    </motion.section>
                ) : (
                    <motion.section
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 flex flex-col items-center justify-center p-6"
                    >
                        <div className="text-center max-w-md">
                            <div className="mb-6 inline-flex items-center justify-center w-20 h-20 bg-cyan-500/10 rounded-full">
                                <CheckCircle className="w-10 h-10 text-cyan-500" />
                            </div>
                            <h2 className="text-4xl font-bold mb-4">{t('success.title')}</h2>
                            <p className="text-zinc-400 text-lg mb-8">{t('success.message')}</p>
                            <Link
                                href="/"
                                className="inline-block px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors"
                            >
                                {t('success.cta')}
                            </Link>
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>
        </main>
    );
}

function BenefitCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
    return (
        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors">
            <div className="mb-4">{icon}</div>
            <h4 className="text-lg font-semibold text-white mb-2">{title}</h4>
            <p className="text-zinc-400 leading-relaxed text-sm">{desc}</p>
        </div>
    );
}
