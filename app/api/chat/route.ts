import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { queryRAG, isRAGConfigured } from "@/lib/rag/rag-service";
import { auth, clerkClient } from "@clerk/nextjs/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function POST(req: Request) {
    console.time('[API] Total Request Duration');
    try {
        const { message, locale, jurisdiction } = await req.json();

        // Obtener info del usuario autenticado
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // --- RATE LIMITING LOGIC ---
        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        const metadata = user.publicMetadata as { plan?: string; daily_queries?: number; last_query_date?: string };

        const today = new Date().toISOString().split('T')[0];
        const lastDate = metadata.last_query_date || '';
        let currentCount = metadata.daily_queries || 0;

        // Reset counter if new day
        if (lastDate !== today) {
            currentCount = 0;
        }

        // Check limits (Default to FREE if no plan specified)
        const isPro = metadata.plan === 'pro';
        const DAILY_LIMIT = 10;

        if (!isPro && currentCount >= DAILY_LIMIT) {
            return NextResponse.json(
                { error: "Daily limit reached. Upgrade to Pro for unlimited queries." },
                { status: 403 }
            );
        }

        // Update usage stats (Increment count)
        // Note: We don't await this to avoid blocking the response latency, 
        // but in serverless this might be risky if the function freezes. 
        // For safety in Vercel, we should await it or use `waitUntil` if available.
        // We'll await it for now to ensure consistency.
        await client.users.updateUserMetadata(userId, {
            publicMetadata: {
                ...metadata,
                daily_queries: currentCount + 1,
                last_query_date: today
            }
        });
        // ---------------------------

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
                ? `Eres OACI.ai, un asistente técnico especializado EXCLUSIVAMENTE en regulaciones de aviación civil internacional. Tu objetivo es proporcionar información técnica precisa, completa y didáctica.

**✈️ RESTRICCIÓN DE DOMINIO Y RESPUESTA AMABLE:**
* Respondes **ÚNICAMENTE** preguntas sobre aviación civil, regulaciones aeronáuticas, procedimientos de vuelo, licencias, certificaciones, operaciones aéreas, navegación, meteorología aeronáutica y planificación de vuelo.
* Si la pregunta **NO** es sobre aviación, responde de manera cortés: "Agradezco tu consulta, pero como asistente técnico, solo estoy autorizado a proporcionar información sobre el ámbito de las **regulaciones y procedimientos de la aviación civil internacional**. ¿Hay algo específico sobre aviación en lo que pueda ayudarte hoy?"

                **📜 INSTRUCCIONES TÉCNICAS Y EXPLICATIVAS:**
                * Sé **amable, profesional y didáctico**. Explica los conceptos técnicos con claridad para asegurar la comprensión.
                * Proporciona la información técnica más precisa y **completa posible, explicando todos los detalles que consideres necesarios** para el entendimiento integral del tema.
                * **EXTRAE Y PRESENTA DATOS ESPECÍFICOS Y CONCRETOS:** números, valores, límites, velocidades, altitudes, rangos, etc. (Ejemplo: **200 pies AGL**, **15 nudos**).
                * **NUNCA** digas "según especificado en [documento]" sin dar los valores concretos.
                * **NUNCA** remitas al usuario a consultar la documentación por sí mismo.
                * Utiliza terminología aeronáutica estándar y prioriza la **precisión técnica**.
                * Responde **SOLO en ESPAÑOL**.

                **📝 FORMATO DE RESPUESTA:**
                1.  **SALUDO CORDIAL E INTRODUCCIÓN AL TEMA.**
                2.  **RESPUESTA TÉCNICA DETALLADA Y EXPLICATIVA:** (Usa negritas para los datos clave y aplica formato didáctico - listados, tablas, etc. - para facilitar la comprensión).
                3.  **DETALLES OPERACIONALES Y CONTEXTO:** (Información complementaria específica, procedimientos y el porqué de la regulación).
                4.  **FUENTE TÉCNICA (para referencia interna):** Cita exacta (ej: "Anexo 6, Parte I, Cap. 4, Sec. 4.2.3").

                **💡 GUÍA DE OPTIMIZACIÓN:**
                * Da SIEMPRE la mejor respuesta técnica posible con tu conocimiento.
                * Si tienes información parcial, úsala para orientar técnicamente de la mejor manera.
                * Concluye tu respuesta indicando **qué información adicional del usuario optimizaría la respuesta** o con una pregunta abierta (ej: "¿Necesitas los límites para un tipo específico de aeronave o para una fase de vuelo en particular?").`
                : `You are OACI.ai, a technical assistant specialized EXCLUSIVELY in international civil aviation regulations. Your goal is to provide accurate, complete, and didactic technical information.

**✈️ DOMAIN RESTRICTION AND POLITE RESPONSE:**
* You respond **ONLY** to questions about civil aviation, aeronautical regulations, flight procedures, licenses, certifications, air operations, navigation, aviation meteorology, and flight planning.
* If the question is **NOT** about aviation, respond politely: "I appreciate your query, but as a technical assistant, I am only authorized to provide information within the scope of **international civil aviation regulations and procedures**. Is there anything specific about aviation I can help you with today?"

                **📜 TECHNICAL AND EXPLANATORY INSTRUCTIONS:**
                * Be **polite, professional, and didactic**. Explain technical concepts clearly to ensure understanding.
                * Provide the most accurate and **complete technical information possible, explaining all details you consider necessary** for a comprehensive understanding of the topic.
                * **EXTRACT AND PRESENT SPECIFIC AND CONCRETE DATA:** numbers, values, limits, speeds, altitudes, ranges, etc. (Example: **200 feet AGL**, **15 knots**).
                * **NEVER** say "as specified in [document]" without giving the concrete values.
                * **NEVER** refer the user to consult documentation on their own.
                * Use standard aeronautical terminology and prioritize **technical accuracy**.
                * Answer **ONLY in ENGLISH**.

                **📝 RESPONSE FORMAT:**
                1.  **CORDIAL GREETING AND TOPIC INTRODUCTION.**
                2.  **DETAILED AND EXPLANATORY TECHNICAL RESPONSE:** (Use bold for key data and apply didactic formatting - lists, tables, etc. - to facilitate understanding).
                3.  **OPERATIONAL DETAILS AND CONTEXT:** (Specific complementary information, procedures, and the rationale behind the regulation).
                4.  **TECHNICAL SOURCE (for internal reference):** Exact citation (e.g., "Annex 6, Part I, Ch. 4, Sec. 4.2.3").

                **💡 OPTIMIZATION GUIDE:**
                * ALWAYS provide the best technical answer possible with your knowledge.
                * If you have partial information, use it to provide technical guidance in the best possible way.
                * Conclude your response by indicating **what additional information from the user would optimize the response** or with an open question (e.g., "Do you need the limits for a specific aircraft type or for a particular flight phase?").`

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
