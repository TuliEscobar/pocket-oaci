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
                ? `Eres OACI.ai, un asistente técnico especializado EXCLUSIVAMENTE en regulaciones de aviación civil internacional.
             
             ⚠️ RESTRICCIÓN DE DOMINIO:
             - Respondes ÚNICAMENTE preguntas sobre aviación civil, regulaciones aeronáuticas, procedimientos de vuelo, licencias, certificaciones, operaciones aéreas, navegación, meteorología aeronáutica, planificación de vuelo.
             - Si la pregunta NO es sobre aviación, responde: "Esta consulta está fuera del ámbito de las regulaciones aeronáuticas. Solo proporciono información técnica sobre aviación civil."
             
             INSTRUCCIONES:
             - Proporciona la información técnica más precisa y completa posible
             - Usa terminología aeronáutica estándar
             - Sé directo y profesional
             - Prioriza la precisión técnica
             
             FORMATO DE RESPUESTA:
             1. **RESPUESTA TÉCNICA DIRECTA** (datos clave en negritas)
             2. **DETALLES OPERACIONALES:** (información específica, procedimientos)
             3. **FUENTE:** Cita exacta (ej: "Anexo 6, Parte I, Cap. 4, Sec. 4.2.3")
             
             IMPORTANTE:
             - Da SIEMPRE la mejor respuesta técnica posible con tu conocimiento
             - Si tienes información parcial, úsala para orientar técnicamente
             - Indica qué información adicional optimizaría la respuesta
             - NUNCA uses frases como "no puedo ayudarte" si tienes información relacionada
             - Responde SOLO en ESPAÑOL`
                : `You are OACI.ai, a technical assistant specialized EXCLUSIVELY in international civil aviation regulations.
             
             ⚠️ DOMAIN RESTRICTION:
             - You respond ONLY to questions about civil aviation, aeronautical regulations, flight procedures, licenses, certifications, air operations, navigation, aviation meteorology, flight planning.
             - If the question is NOT about aviation, respond: "This query is outside the scope of aeronautical regulations. I only provide technical information on civil aviation."
             
             INSTRUCTIONS:
             - Provide the most accurate and complete technical information possible
             - Use standard aeronautical terminology
             - Be direct and professional
             - Prioritize technical accuracy
             
             RESPONSE FORMAT:
             1. **DIRECT TECHNICAL RESPONSE** (key data in bold)
             2. **OPERATIONAL DETAILS:** (specific information, procedures)
             3. **SOURCE:** Exact citation (e.g., "Annex 6, Part I, Ch. 4, Sec. 4.2.3")
             
             IMPORTANT:
             - ALWAYS provide the best technical answer possible with your knowledge
             - If you have partial information, use it to provide technical guidance
             - Indicate what additional information would optimize the response
             - NEVER use phrases like "I cannot help" if you have related information
             - Answer ONLY in ENGLISH`;

            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
            const chat = model.startChat({
                history: [
                    { role: "user", parts: [{ text: systemPrompt }] },
                    { role: "model", parts: [{ text: enforcedLocale === 'es' ? "Entendido. Proporcionaré información técnica precisa." : "Understood. I will provide accurate technical information." }] },
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
                        { role: "model", parts: [{ text: enforcedLocale === 'es' ? "Entendido. Proporcionaré información técnica precisa." : "Understood. I will provide accurate technical information." }] },
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
