import React from 'react';

const DOCUMENTS = [
    "ICAO Anexo 15",
    "RAAC Parte 61",
    "RAAC Parte 91",
    "RAAC Parte 135",
    "RAAC Parte 65",
    "PR GOPE 069",
    "PROGEN ARO",
    "PROGEN ATM",
    "ICAO Doc 4444"
];

export default function DocumentTicker() {
    return (
        <div className="w-full bg-zinc-950/50 border-y border-zinc-900 overflow-hidden py-2 relative">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black to-transparent z-10" />

            <div className="flex animate-scroll whitespace-nowrap">
                {/* Repetimos la lista varias veces para el efecto infinito */}
                {[...DOCUMENTS, ...DOCUMENTS, ...DOCUMENTS].map((doc, i) => (
                    <div key={i} className="mx-6 flex items-center gap-2 text-zinc-500 text-xs font-mono uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-900/50" />
                        {doc}
                    </div>
                ))}
            </div>

            <style jsx>{`
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
      `}</style>
        </div>
    );
}
