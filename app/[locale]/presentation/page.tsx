"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Plane, Brain, Database, Globe, User, ShieldCheck, Zap } from "lucide-react";
import Image from "next/image";

// Slide Data
const slides = [
    {
        id: "intro",
        component: (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
                <div className="relative w-64 h-64 mb-8">
                    <Image src="/oaci_logo_large.jpg" alt="OACI.ai Logo" fill className="object-contain" priority />
                </div>
                <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
                    OACI.ai
                </h1>
                <h2 className="text-3xl text-gray-300">Presentación Corporativa</h2>
                <div className="mt-12 p-6 border border-white/10 rounded-xl bg-white/5 backdrop-blur-sm">
                    <p className="text-xl font-semibold text-white">KCN Desayuno de Networking - Mallorca</p>
                    <p className="text-gray-400 mt-2">4 de Diciembre, 2025</p>
                </div>
                <p className="absolute bottom-10 text-gray-500 animate-pulse">Presione → para comenzar</p>
            </div>
        ),
    },
    {
        id: "presenter",
        component: (
            <div className="flex flex-col h-full justify-center max-w-5xl mx-auto px-4">
                <h2 className="text-4xl font-bold text-cyan-400 mb-12">¿Quién soy?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-stretch">
                    <div className="space-y-8 flex flex-col justify-center">
                        <h3 className="text-5xl font-bold text-white">Héctor Escobar</h3>
                        <ul className="space-y-6 text-xl text-gray-300">
                            <li className="flex items-center gap-4">
                                <div className="p-3 bg-cyan-500/10 rounded-lg">
                                    <Plane className="text-cyan-400 w-6 h-6" />
                                </div>
                                <span>Controlador Aéreo</span>
                            </li>
                            <li className="flex items-center gap-4">
                                <div className="p-3 bg-cyan-500/10 rounded-lg">
                                    <ShieldCheck className="text-cyan-400 w-6 h-6" />
                                </div>
                                <span>Supervisor de servicio de información aeronautica</span>
                            </li>
                            <li className="flex items-center gap-4">
                                <div className="p-3 bg-purple-500/10 rounded-lg">
                                    <Globe className="text-purple-400 w-6 h-6" />
                                </div>
                                <span>Desarrollador Web</span>
                            </li>
                            <li className="flex items-center gap-4">
                                <div className="p-3 bg-purple-500/10 rounded-lg">
                                    <Brain className="text-purple-400 w-6 h-6" />
                                </div>
                                <span>Especialista de Inteligencia Artificial</span>
                            </li>
                        </ul>
                        <blockquote className="border-l-4 border-cyan-500 pl-6 py-2 italic text-gray-400 mt-8 text-lg bg-white/5 rounded-r-lg">
                            "En la aviación, el acceso rápido a información de calidad no es un lujo, es seguridad operacional."
                        </blockquote>
                    </div>
                    <div className="relative w-full h-auto min-h-[500px] bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden group">
                        <Image
                            src="/hector_profile.png"
                            alt="Héctor Escobar"
                            fill
                            className="object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-8">
                            <div>
                                <p className="text-white font-bold text-2xl">Héctor Escobar</p>
                                <p className="text-cyan-400 text-lg">Founder & CEO</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ),
    },
    {
        id: "what-is-it",
        component: (
            <div className="flex flex-col h-full justify-center max-w-5xl mx-auto text-center px-4">
                <h2 className="text-5xl md:text-7xl font-bold text-white mb-8">¿Qué es <span className="text-cyan-400">OACI.ai</span>?</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 items-center">
                    <div className="p-10 rounded-3xl bg-white/5 border border-white/10 hover:border-cyan-400/50 transition-all hover:-translate-y-2 duration-300">
                        <Globe className="w-20 h-20 text-blue-400 mx-auto mb-6" />
                        <h3 className="text-3xl font-bold text-white mb-2">OACI</h3>
                        <p className="text-gray-400 text-lg">Organización de Aviación Civil Internacional</p>
                    </div>
                    <div className="flex items-center justify-center">
                        <span className="text-6xl font-bold text-gray-600">+</span>
                    </div>
                    <div className="p-10 rounded-3xl bg-white/5 border border-white/10 hover:border-purple-400/50 transition-all hover:-translate-y-2 duration-300">
                        <Brain className="w-20 h-20 text-purple-400 mx-auto mb-6" />
                        <h3 className="text-3xl font-bold text-white mb-2">AI</h3>
                        <p className="text-gray-400 text-lg">Inteligencia Artificial Avanzada</p>
                    </div>
                </div>

                <div className="mt-20">
                    <p className="text-4xl font-light text-cyan-200 italic">
                        "Tu copiloto regulatorio inteligente"
                    </p>
                    <p className="mt-6 text-2xl text-gray-400 max-w-3xl mx-auto">
                        Una plataforma que unifica el acceso a la información aeronáutica crítica, transformando documentos estáticos en respuestas inmediatas.
                    </p>
                </div>
            </div>
        ),
    },
    {
        id: "problem",
        component: (
            <div className="flex flex-col h-full justify-center max-w-6xl mx-auto px-4">
                <h2 className="text-4xl font-bold text-red-400 mb-16">El Problema</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8 text-xl text-gray-300">
                        <div className="flex gap-4 items-start">
                            <div className="p-2 bg-red-500/10 rounded mt-1">
                                <Database className="w-6 h-6 text-red-400" />
                            </div>
                            <div>
                                <strong className="text-white block text-2xl mb-2">Sobrecarga de Información</strong>
                                <p>Miles de páginas de Anexos, RAACs, LARs y documentos internos dispersos.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="p-2 bg-red-500/10 rounded mt-1">
                                <div className="w-6 h-6 text-red-400 font-bold text-center">PDF</div>
                            </div>
                            <div>
                                <strong className="text-white block text-2xl mb-2">Datos Estáticos</strong>
                                <p>PDFs difíciles de buscar, imposibles de correlacionar rápidamente en situaciones críticas.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="p-2 bg-red-500/10 rounded mt-1">
                                <ShieldCheck className="w-6 h-6 text-red-400" />
                            </div>
                            <div>
                                <strong className="text-white block text-2xl mb-2">Incertidumbre Operacional</strong>
                                <p>¿Estoy viendo la última enmienda? ¿Aplica esta norma a mi operación específica?</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-red-900/20 to-black border border-red-500/20 rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-2xl shadow-red-900/10">
                        <span className="text-8xl font-bold text-red-500 block mb-4">90%</span>
                        <span className="text-2xl text-gray-300">del tiempo se pierde buscando información,</span>
                        <span className="text-2xl text-white font-bold mt-2">en lugar de analizarla.</span>
                    </div>
                </div>
            </div>
        ),
    },
    {
        id: "solution",
        component: (
            <div className="flex flex-col h-full justify-center max-w-7xl mx-auto px-4">
                <h2 className="text-4xl font-bold text-green-400 mb-8">La Solución: RAG & IA</h2>
                <div className="relative w-full h-[65vh] bg-white/5 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                    <Image
                        src="/how_it_works.png"
                        alt="Como funciona OACI.ai"
                        fill
                        className="object-contain p-8"
                    />
                </div>
                <p className="text-center mt-8 text-2xl text-gray-300">
                    Transformamos documentos estáticos en <span className="text-green-400 font-bold">respuestas dinámicas, precisas y citadas</span>.
                </p>
            </div>
        ),
    },
    {
        id: "technology",
        component: (
            <div className="flex flex-col h-full justify-center max-w-6xl mx-auto px-4">
                <h2 className="text-4xl font-bold text-purple-400 mb-12">Tecnología: El Motor de OACI.ai</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-yellow-500/10 rounded-xl">
                                <Zap className="text-yellow-400 w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-white">Google Gemini 3.0 Pro</h3>
                                <span className="text-green-400 text-sm font-mono border border-green-500/30 px-2 py-0.5 rounded-full bg-green-500/10">Released: Nov 18, 2025</span>
                            </div>
                        </div>

                        <p className="text-xl text-gray-300 leading-relaxed">
                            No es solo un chatbot. Es un sistema de razonamiento avanzado capaz de entender la complejidad aeronáutica.
                        </p>

                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <div className="mt-1 w-2 h-2 rounded-full bg-purple-500" />
                                <div>
                                    <strong className="text-white block">Multimodal Nativo</strong>
                                    <span className="text-gray-400">Entiende texto, imágenes (cartas de navegación), audio y video simultáneamente.</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-1 w-2 h-2 rounded-full bg-purple-500" />
                                <div>
                                    <strong className="text-white block">Razonamiento "Chain of Thought"</strong>
                                    <span className="text-gray-400">Desglosa consultas complejas paso a paso antes de responder, reduciendo errores.</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-1 w-2 h-2 rounded-full bg-purple-500" />
                                <div>
                                    <strong className="text-white block">Velocidad Flash</strong>
                                    <span className="text-gray-400">Latencia ultra-baja para respuestas en tiempo real, crítico para operaciones.</span>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/10 p-8 rounded-3xl border border-purple-500/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-20">
                            <Brain className="w-32 h-32 text-purple-500" />
                        </div>
                        <div className="relative z-10 space-y-6">
                            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                <span className="text-xs text-gray-500 uppercase tracking-wider">Input</span>
                                <p className="text-gray-300 italic">"¿Cuál es el mínimo meteorológico para despegue en SAEZ con RVR inoperativo?"</p>
                            </div>
                            <div className="flex justify-center">
                                <div className="w-0.5 h-8 bg-gradient-to-b from-gray-500 to-purple-500" />
                            </div>
                            <div className="bg-purple-500/10 p-4 rounded-xl border border-purple-500/30">
                                <span className="text-xs text-purple-400 uppercase tracking-wider">Gemini 3.0 Reasoning</span>
                                <p className="text-white font-medium">
                                    Analizando RAAC 91... Verificando cartas de SAEZ... Cruzando con NOTAMs...
                                    <br />
                                    <span className="text-cyan-400 mt-2 block">Respuesta generada en 0.8s</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ),
    },
    {
        id: "stargate",
        component: (
            <div className="flex flex-col h-full justify-center max-w-6xl mx-auto px-4">
                <h2 className="text-4xl font-bold text-cyan-400 mb-12">Contexto Global: Proyecto Stargate</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
                            <h3 className="text-6xl font-bold text-white mb-2">$500B</h3>
                            <p className="text-xl text-cyan-400 uppercase tracking-widest">Inversión en Infraestructura IA</p>
                        </div>

                        <p className="text-2xl text-gray-300 leading-relaxed">
                            La mayor inversión tecnológica de la historia moderna. Estados Unidos lanza el "Proyecto Manhattan" de la Inteligencia Artificial.
                        </p>

                        <div className="flex flex-wrap gap-4 mt-4">
                            {['OpenAI', 'SoftBank', 'Oracle', 'MGX'].map(partner => (
                                <span key={partner} className="px-4 py-2 bg-white/10 rounded-lg text-white font-semibold border border-white/5">
                                    {partner}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="relative h-[400px] md:h-[500px] w-full bg-white/5 rounded-3xl border border-white/10 overflow-hidden group shadow-2xl shadow-cyan-900/20">
                        <Image
                            src="/stargate_infographic.jpg"
                            alt="Infografía Proyecto Stargate"
                            fill
                            className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute bottom-6 right-6">
                            <a
                                href="https://en.wikipedia.org/wiki/Stargate_Project"
                                target="_blank"
                                className="flex items-center gap-2 text-cyan-400 hover:text-white transition-colors bg-black/80 px-4 py-2 rounded-full backdrop-blur-md border border-cyan-500/30 hover:bg-cyan-500/20"
                            >
                                <Globe className="w-4 h-4" />
                                <span className="text-sm font-medium">Fuente: Wikipedia</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        ),
    },
    {
        id: "future",
        component: (
            <div className="flex flex-col h-full justify-center max-w-6xl mx-auto text-center px-4">
                <h2 className="text-5xl font-bold text-white mb-16">El Futuro es Ahora</h2>
                <p className="text-3xl text-gray-300 mb-16 max-w-4xl mx-auto">
                    La tecnología de OACI.ai es <span className="text-cyan-400 font-bold">agnóstica y escalable</span> a cualquier industria regulada.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white/5 rounded-3xl border border-white/10 hover:border-cyan-400/50 hover:-translate-y-2 transition-all duration-300 group">
                        <div className="p-4 bg-cyan-500/10 rounded-full w-fit mx-auto mb-6 group-hover:bg-cyan-500/20 transition-colors">
                            <Plane className="w-12 h-12 text-cyan-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Aeronaves Específicas</h3>
                        <p className="text-gray-400">Manuales de vuelo (FCOM), MEL y mantenimiento (Boeing, Airbus, Embraer).</p>
                    </div>
                    <div className="p-8 bg-white/5 rounded-3xl border border-white/10 hover:border-cyan-400/50 hover:-translate-y-2 transition-all duration-300 group">
                        <div className="p-4 bg-cyan-500/10 rounded-full w-fit mx-auto mb-6 group-hover:bg-cyan-500/20 transition-colors">
                            <Database className="w-12 h-12 text-cyan-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Procedimientos Privados</h3>
                        <p className="text-gray-400">Normativas internas de aerolíneas, SOPs y manuales de operaciones.</p>
                    </div>
                    <div className="p-8 bg-white/5 rounded-3xl border border-white/10 hover:border-cyan-400/50 hover:-translate-y-2 transition-all duration-300 group">
                        <div className="p-4 bg-cyan-500/10 rounded-full w-fit mx-auto mb-6 group-hover:bg-cyan-500/20 transition-colors">
                            <Globe className="w-12 h-12 text-cyan-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Otras Industrias</h3>
                        <p className="text-gray-400">Náutica, Legal, Medicina, Construcción y cualquier sector con alta carga regulatoria.</p>
                    </div>
                </div>
            </div>
        ),
    },
    {
        id: "contact",
        component: (
            <div className="flex flex-col h-full justify-center items-center text-center space-y-12 px-4">
                <h2 className="text-6xl font-bold text-white">¿Preguntas?</h2>

                <div className="p-1 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl shadow-2xl shadow-cyan-500/20">
                    <div className="bg-white p-2 rounded-xl">
                        <div className="relative w-64 h-64 bg-white flex items-center justify-center rounded-lg overflow-hidden">
                            <Image src="/contact_qr.jpg" fill alt="QR Business Card" className="object-contain" />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-4xl font-bold text-cyan-400">Héctor Escobar</h3>
                    <p className="text-2xl text-gray-300">Founder & CEO</p>
                    <div className="pt-8 space-y-2 text-xl text-gray-400">
                        <p>consultas@oaci.ai</p>
                        <p>+34 652 877 106</p>
                        <p className="font-mono text-cyan-400">oaci.ai</p>
                    </div>
                </div>
            </div>
        ),
    },
    {
        id: "thanks",
        component: (
            <div className="flex flex-col h-full justify-center items-center text-center space-y-12 px-4">
                <h2 className="text-6xl font-bold text-white">MUCHAS GRACIAS</h2>

                <div className="p-1 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl shadow-2xl shadow-cyan-500/20">
                    <div className="bg-white p-2 rounded-xl">
                        <div className="relative w-64 h-64 bg-white flex items-center justify-center rounded-lg overflow-hidden">
                            <Image src="/contact_qr.jpg" fill alt="QR Business Card" className="object-contain" />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-4xl font-bold text-cyan-400">Héctor Escobar</h3>
                    <p className="text-2xl text-gray-300">Founder & CEO</p>
                    <div className="pt-8 space-y-2 text-xl text-gray-400">
                        <p>consultas@oaci.ai</p>
                        <p>+34 652 877 106</p>
                        <p className="font-mono text-cyan-400">oaci.ai</p>
                    </div>
                </div>
            </div>
        ),
    }
];

export default function PresentationPage() {
    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(prev => prev + 1);
        }
    };

    const prevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(prev => prev - 1);
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight" || e.key === "Space" || e.key === "Enter") {
                nextSlide();
            } else if (e.key === "ArrowLeft") {
                prevSlide();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentSlide]);

    return (
        <div className="h-screen w-full bg-[#09090b] text-white overflow-hidden relative font-sans selection:bg-cyan-500/30">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/10 via-[#09090b] to-[#09090b] pointer-events-none" />

            {/* Slide Content */}
            <div className="relative z-10 h-full w-full p-4 md:p-12 flex items-center justify-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, x: 50, filter: "blur(10px)" }}
                        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, x: -50, filter: "blur(10px)" }}
                        transition={{ duration: 0.5, ease: "circOut" }}
                        className="h-full w-full"
                    >
                        {slides[currentSlide].component}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Controls */}
            <div className="absolute bottom-8 right-8 flex gap-4 z-20 items-center">
                <button
                    onClick={prevSlide}
                    disabled={currentSlide === 0}
                    className="p-4 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all backdrop-blur-sm border border-white/10"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <span className="text-gray-500 font-mono text-sm whitespace-nowrap">
                    {currentSlide + 1} / {slides.length}
                </span>
                <button
                    onClick={nextSlide}
                    disabled={currentSlide === slides.length - 1}
                    className="p-4 rounded-full bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 disabled:opacity-30 transition-all backdrop-blur-sm border border-cyan-500/20 shadow-lg shadow-cyan-500/10"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 h-1.5 bg-zinc-800 w-full">
                <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                    style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
                />
            </div>

            {/* Watermark */}
            <div className="absolute top-8 left-8 opacity-50">
                <div className="flex items-center gap-2">
                    <Image src="/logo.png" width={24} height={24} alt="Logo" />
                    <span className="font-bold text-sm text-gray-400">OACI.ai</span>
                </div>
            </div>
        </div>
    );
}
