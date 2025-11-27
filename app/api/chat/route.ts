import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { queryRAG, isRAGConfigured } from "@/lib/rag/rag-service";
import { auth } from "@clerk/nextjs/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function POST(req: Request) {
    console.time('[API] Total Request Duration');
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
        const enforcedLocale = jurisdiction === 'ARG' ? 'es' : 'en';

        // Intentar usar RAG si está configurado
        const ragConfigured = await isRAGConfigured();

        let streamResult: any;
        let sources: any[] = [];
        let modelName = "gemini-2.0-flash-exp";
        let sourceLabel = "AI Generated";

        if (ragConfigured) {
            console.log(`🔍 Using RAG (Jurisdiction: ${jurisdiction || 'ICAO'}, Language: ${enforcedLocale})...`);
            try {
                const ragResult = await queryRAG(message, enforcedLocale, jurisdiction);
                streamResult = ragResult.stream;
                sources = ragResult.sources.map(s => ({
                    source: s.source,
                    section: s.section,
                    score: s.score,
                    // Truncate preview to avoid huge headers/payloads
                    preview: s.text.substring(0, 100) + '...'
                }));
                modelName = ragResult.model;
                sourceLabel = "RAG - Official ICAO Documents";
            } catch (ragError: any) {
                console.error("RAG failed, falling back to standard mode:", ragError.message);
                // Fallback to standard mode will happen below if streamResult is null
            }
        } else {
            console.log("⚠️  RAG not configured, using standard mode");
        }

        // Fallback: Modo estándar sin RAG (o si RAG falló)
        if (!streamResult) {
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

            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
            const chat = model.startChat({
                history: [
                    { role: "user", parts: [{ text: systemPrompt }] },
                    { role: "model", parts: [{ text: enforcedLocale === 'es' ? "Entendido. Soy OACI.ai." : "Understood. I am OACI.ai." }] },
                ],
            });

            try {
                streamResult = await chat.sendMessageStream(message);
                modelName = "gemini-2.0-flash-exp";
            } catch (error) {
                // Fallback to gemini-pro if 2.0 fails
                console.log("Falling back to gemini-pro...");
                const fallbackModel = genAI.getGenerativeModel({ model: "gemini-pro" });
                const fallbackChat = fallbackModel.startChat({
                    history: [
                        { role: "user", parts: [{ text: systemPrompt }] },
                        { role: "model", parts: [{ text: enforcedLocale === 'es' ? "Entendido. Soy OACI.ai." : "Understood. I am OACI.ai." }] },
                    ],
                });
                streamResult = await fallbackChat.sendMessageStream(message);
                modelName = "gemini-pro";
            }
            sourceLabel = "AI Generated (Verify with Official Docs)";
        }

        // Create a streaming response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    // 1. Send Metadata Chunk
                    const metadata = {
                        type: 'metadata',
                        sources: sources,
                        source: sourceLabel,
                        model: modelName
                    };
                    controller.enqueue(encoder.encode(JSON.stringify(metadata) + '\n'));

                    // 2. Stream Text Chunks
                    for await (const chunk of streamResult.stream) {
                        const chunkText = chunk.text();
                        if (chunkText) {
                            const data = {
                                type: 'chunk',
                                text: chunkText
                            };
                            controller.enqueue(encoder.encode(JSON.stringify(data) + '\n'));
                        }
                    }

                    console.timeEnd('[API] Total Request Duration');
                    controller.close();
                } catch (error) {
                    console.error("Streaming error:", error);
                    controller.error(error);
                }
            }
        });

        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'application/x-ndjson; charset=utf-8',
                'Transfer-Encoding': 'chunked'
            }
        });

    } catch (error: any) {
        console.error("All Gemini Models Failed:", error);
        console.timeEnd('[API] Total Request Duration');
        return NextResponse.json(
            { error: `AI Error: ${error.message || "Unknown error"}` },
            { status: 500 }
        );
    }
}
