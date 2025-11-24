import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { queryRAG, isRAGConfigured } from "@/lib/rag/rag-service";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { message, locale } = await req.json();

        if (!process.env.GOOGLE_API_KEY) {
            return NextResponse.json(
                { error: "GOOGLE_API_KEY not configured" },
                { status: 500 }
            );
        }

        // Intentar usar RAG si está configurado
        const ragConfigured = await isRAGConfigured();

        if (ragConfigured) {
            console.log("🔍 Using RAG with official ICAO documents...");
            try {
                const ragResult = await queryRAG(message, locale);

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
        const systemPrompt = locale === 'es'
            ? `Eres OACI.ai, un asistente experto en regulaciones de aviación civil internacional.
         
         FORMATO DE RESPUESTA OBLIGATORIO:
         1. RESPUESTA DIRECTA: Comienza con la respuesta concreta en 1-2 líneas (en negritas si es posible).
         2. EXPLICACIÓN: Desarrolla los detalles necesarios.
         3. FUENTE: Termina SIEMPRE citando el Anexo, Documento, Capítulo y Sección específicos (ej: "Anexo 6, Parte I, Capítulo 4, Sección 4.2.3").
         
         Reglas:
         - Sé claro, directo y profesional.
         - Usa terminología aeronáutica correcta.
         - NUNCA respondas sin citar la fuente exacta (Anexo + sección).
         - Si no conoces la respuesta exacta, dilo claramente.
         - Responde SOLO en ESPAÑOL.`
            : `You are OACI.ai, an expert assistant in international civil aviation regulations.
         
         MANDATORY RESPONSE FORMAT:
         1. DIRECT ANSWER: Start with the concrete answer in 1-2 lines (bold if possible).
         2. EXPLANATION: Develop the necessary details.
         3. SOURCE: Always end by citing the specific Annex, Document, Chapter, and Section (e.g., "Annex 6, Part I, Chapter 4, Section 4.2.3").
         
         Rules:
         - Be clear, direct, and professional.
         - Use correct aeronautical terminology.
         - NEVER answer without citing the exact source (Annex + section).
         - If you don't know the exact answer, state it clearly.
         - Answer ONLY in ENGLISH.`;

        // Helper to run chat with a specific model
        async function runChat(modelName: string) {
            const model = genAI.getGenerativeModel({ model: modelName });
            const chat = model.startChat({
                history: [
                    { role: "user", parts: [{ text: systemPrompt }] },
                    { role: "model", parts: [{ text: locale === 'es' ? "Entendido. Soy OACI.ai." : "Understood. I am OACI.ai." }] },
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
