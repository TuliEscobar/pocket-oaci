import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { queryRAG, isRAGConfigured } from "@/lib/rag/rag-service";
import { auth } from "@clerk/nextjs/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { message, locale, jurisdiction } = await req.json();

        // Obtener info del usuario autenticado
        const { userId } = await auth();

        // 📝 Log para Vercel Analytics/Logs
        console.log(`💬 Query [${jurisdiction || 'ICAO'}] from user ${userId || 'anonymous'}: "${message}"`);

        if (!process.env.GOOGLE_API_KEY) {
            return NextResponse.json(
                { error: "GOOGLE_API_KEY not configured" },
                { status: 500 }
            );
        }

        // Enforce language based on jurisdiction
        // Argentina (ARG) -> Spanish (es)
        // ICAO -> English (en)
        const enforcedLocale = jurisdiction === 'ARG' ? 'es' : 'en';

        // Intentar usar RAG si está configurado
        const ragConfigured = await isRAGConfigured();

        if (ragConfigured) {
            console.log(`🔍 Using RAG (Jurisdiction: ${jurisdiction || 'ICAO'}, Language: ${enforcedLocale})...`);
            try {
                const ragResult = await queryRAG(message, enforcedLocale, jurisdiction);

                // 📊 Log respuesta para Vercel
                console.log(`✅ Response [RAG]: ${ragResult.answer.substring(0, 150)}...`);
                console.log(`📚 Sources used: ${ragResult.sources.map(s => s.source).join(', ')}`);

                return NextResponse.json({
                    text: ragResult.answer,
                    sources: ragResult.sources.map(s => ({
                        source: s.source,
                        section: s.section,
                        score: s.score,
                        preview: s.text.substring(0, 200) + '...'
                    })),
                    source: "RAG - Official ICAO Documents",
                    model: ragResult.model
                });
            } catch (ragError: any) {
                console.error("RAG failed, falling back to standard mode:", ragError.message);
                // Continuar con el modo estándar si RAG falla
            }
        } else {
            console.log("⚠️  RAG not configured, using standard mode");
        }

        // Fallback: Modo estándar sin RAG
        const systemPrompt = enforcedLocale === 'es'
            ? `Eres OACI.ai, un asistente experto en regulaciones de aviación civil internacional.
         
         FORMATO DE RESPUESTA OBLIGATORIO:
         1. RESPUESTA DIRECTA: Comienza con la respuesta concreta en 1-2 líneas (usa **negritas** en markdown).
         2. EXPLICACIÓN: Desarrolla los detalles necesarios usando listas y formato markdown.
         3. FUENTE: Termina SIEMPRE citando el Anexo, Documento, Capítulo y Sección específicos (ej: "Anexo 6, Parte I, Capítulo 4, Sección 4.2.3").
         
         Reglas:
         - Sé claro, directo y profesional.
         - Usa terminología aeronáutica correcta.
         - NUNCA respondas sin citar la fuente exacta (Anexo + sección).
         - Si no conoces la respuesta exacta, dilo claramente.
         - Responde SOLO en ESPAÑOL.
         - USA FORMATO MARKDOWN: **negritas** para puntos clave, listas numeradas/con viñetas, etc.`
            : `You are OACI.ai, an expert assistant in international civil aviation regulations.
         
         MANDATORY RESPONSE FORMAT:
         1. DIRECT ANSWER: Start with the concrete answer in 1-2 lines (use **bold** in markdown).
         2. EXPLANATION: Develop the necessary details using lists and markdown formatting.
         3. SOURCE: Always end by citing the specific Annex, Document, Chapter, and Section (e.g., "Annex 6, Part I, Chapter 4, Section 4.2.3").
         
         Rules:
         - Be clear, direct, and professional.
         - Use correct aeronautical terminology.
         - NEVER answer without citing the exact source (Annex + section).
         - If you don't know the exact answer, state it clearly.
         - Answer ONLY in ENGLISH.
         - USE MARKDOWN FORMAT: **bold** for key points, numbered/bulleted lists, etc.`;

        // Helper to run chat with a specific model
        async function runChat(modelName: string) {
            const model = genAI.getGenerativeModel({ model: modelName });
            const chat = model.startChat({
                history: [
                    { role: "user", parts: [{ text: systemPrompt }] },
                    { role: "model", parts: [{ text: enforcedLocale === 'es' ? "Entendido. Soy OACI.ai." : "Understood. I am OACI.ai." }] },
                ],
            });
            return await chat.sendMessage(message);
        }

        let text = "";

        try {
            // Attempt 1: Gemini 2.5 Pro Preview (Available)
            console.log("Attempting with gemini-2.5-pro-preview-03-25...");
            const result = await runChat("gemini-2.5-pro-preview-03-25");
            text = result.response.text();
        } catch (error: any) {
            console.warn("Gemini 2.5 failed:", error.message);

            // Attempt 2: Fallback to standard pro just in case
            console.log("Falling back to gemini-pro...");
            const result = await runChat("gemini-pro");
            text = result.response.text();
        }

        // 📊 Log respuesta para Vercel (modo estándar)
        console.log(`✅ Response [Standard]: ${text.substring(0, 150)}...`);

        return NextResponse.json({
            text: text,
            source: "AI Generated (Verify with Official Docs)"
        });

    } catch (error: any) {
        console.error("All Gemini Models Failed:", error);
        return NextResponse.json(
            { error: `AI Error: ${error.message || "Unknown error"}` },
            { status: 500 }
        );
    }
}
