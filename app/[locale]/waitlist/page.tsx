'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { Plane, CheckCircle, Zap, Users, Gift, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useUser, SignInButton } from '@clerk/nextjs';

export default function WaitlistPage() {
    const t = useTranslations('Waitlist');
    const { user, isLoaded, isSignedIn } = useUser();
    const [formData, setFormData] = useState({
        email: '',
        company: '',
        role: '',
        document: '',
        painPoint: '',
        companySize: '',
        useCase: '',
        customData: ''
    });
    const [formType, setFormType] = useState<'individual' | 'company'>('individual');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user?.primaryEmailAddress?.emailAddress) {
            setFormData(prev => ({ ...prev, email: user.primaryEmailAddress!.emailAddress }));
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    formType
                })
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
                    <img src="/logo.png" alt="OACI.ai" className="h-12 w-auto object-contain" />
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
                            {!isLoaded ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
                                </div>
                            ) : !isSignedIn ? (
                                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 text-center shadow-2xl shadow-cyan-500/5">
                                    <div className="mb-6 inline-flex items-center justify-center w-16 h-16 bg-zinc-800 rounded-full">
                                        <Lock className="w-8 h-8 text-zinc-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">
                                        {t('auth_required.title', { defaultMessage: 'Registro Requerido' })}
                                    </h3>
                                    <p className="text-zinc-400 mb-8">
                                        {t('auth_required.description', { defaultMessage: 'Para asegurar la calidad de la lista de espera, por favor inicia sesión o regístrate antes de continuar.' })}
                                    </p>
                                    <SignInButton mode="modal">
                                        <button className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20">
                                            {t('auth_required.button', { defaultMessage: 'Iniciar Sesión / Registrarse' })}
                                        </button>
                                    </SignInButton>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 shadow-2xl shadow-cyan-500/5">
                                        {/* Form Type Toggle */}
                                        <div className="flex bg-zinc-900 p-1 rounded-xl mb-8">
                                            <button
                                                type="button"
                                                onClick={() => setFormType('individual')}
                                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${formType === 'individual' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}
                                            >
                                                {t('typeSelector.individual')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormType('company')}
                                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${formType === 'company' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}
                                            >
                                                {t('typeSelector.company')}
                                            </button>
                                        </div>

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
                                                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={!!user?.primaryEmailAddress?.emailAddress}
                                            />
                                        </div>

                                        {/* Company Name (Conditional) */}
                                        {formType === 'company' && (
                                            <div className="mb-6">
                                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                                    {t('form.company')} <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.company}
                                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                                    placeholder={t('form.companyPlaceholder')}
                                                    className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-colors"
                                                />
                                            </div>
                                        )}

                                        {/* Company Size (Conditional) */}
                                        {formType === 'company' && (
                                            <div className="mb-6">
                                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                                    {t('form.companySize')}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.companySize}
                                                    onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                                                    placeholder={t('form.companySizePlaceholder')}
                                                    className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-colors"
                                                />
                                            </div>
                                        )}

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
                                                {formType === 'individual' ? (
                                                    <>
                                                        <option value="pilot_commercial">{t('form.roles.pilot_commercial')}</option>
                                                        <option value="pilot_student">{t('form.roles.pilot_student')}</option>
                                                        <option value="atc">{t('form.roles.atc')}</option>
                                                        <option value="dispatcher">{t('form.roles.dispatcher')}</option>
                                                        <option value="instructor">{t('form.roles.instructor')}</option>
                                                        <option value="mechanic">{t('form.roles.mechanic')}</option>
                                                        <option value="airport_ops">{t('form.roles.airport_ops')}</option>
                                                        <option value="ais_operator">{t('form.roles.ais_operator')}</option>
                                                        <option value="enthusiast">{t('form.roles.enthusiast')}</option>
                                                        <option value="other">{t('form.roles.other')}</option>
                                                    </>
                                                ) : (
                                                    <>
                                                        <option value="ceo">{t('form.companyRoles.ceo')}</option>
                                                        <option value="coo">{t('form.companyRoles.coo')}</option>
                                                        <option value="operations_manager">{t('form.companyRoles.operations_manager')}</option>
                                                        <option value="safety_manager">{t('form.companyRoles.safety_manager')}</option>
                                                        <option value="training_manager">{t('form.companyRoles.training_manager')}</option>
                                                        <option value="fleet_manager">{t('form.companyRoles.fleet_manager')}</option>
                                                        <option value="compliance_officer">{t('form.companyRoles.compliance_officer')}</option>
                                                        <option value="it_manager">{t('form.companyRoles.it_manager')}</option>
                                                        <option value="procurement">{t('form.companyRoles.procurement')}</option>
                                                        <option value="other">{t('form.companyRoles.other')}</option>
                                                    </>
                                                )}
                                            </select>
                                        </div>

                                        {/* Use Case (Conditional) */}
                                        {formType === 'company' && (
                                            <div className="mb-6">
                                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                                    {t('form.useCase')}
                                                </label>
                                                <textarea
                                                    value={formData.useCase}
                                                    onChange={(e) => setFormData({ ...formData, useCase: e.target.value })}
                                                    placeholder={t('form.useCasePlaceholder')}
                                                    rows={3}
                                                    className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-colors resize-none"
                                                />
                                            </div>
                                        )}

                                        {/* Custom Data (Conditional) */}
                                        {formType === 'company' && (
                                            <div className="mb-6">
                                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                                    {t('form.customData')}
                                                </label>
                                                <div className="flex gap-4">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="customData"
                                                            value="yes"
                                                            checked={formData.customData === 'yes'}
                                                            onChange={(e) => setFormData({ ...formData, customData: e.target.value })}
                                                            className="text-cyan-500 focus:ring-cyan-500 bg-black border-zinc-800"
                                                        />
                                                        <span className="text-zinc-400 text-sm">{t('form.customDataYes')}</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="customData"
                                                            value="no"
                                                            checked={formData.customData === 'no'}
                                                            onChange={(e) => setFormData({ ...formData, customData: e.target.value })}
                                                            className="text-cyan-500 focus:ring-cyan-500 bg-black border-zinc-800"
                                                        />
                                                        <span className="text-zinc-400 text-sm">{t('form.customDataNo')}</span>
                                                    </label>
                                                </div>
                                            </div>
                                        )}

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
                            )}
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
        </main >
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
