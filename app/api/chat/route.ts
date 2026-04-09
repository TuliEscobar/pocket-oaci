import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { queryRAG, isRAGConfigured } from "@/lib/rag/rag-service";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function POST(req: Request) {
    console.time('[API] Total Request Duration');
    try {
        const { message, locale, jurisdiction, chatId: requestedChatId } = await req.json();

        // Obtener info del usuario autenticado (opcional para consulta gratuita)
        const { userId } = await auth();
        let chatId = requestedChatId;

        // Solo aplicar rate limiting si el usuario está autenticado
        if (userId) {
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
            await client.users.updateUserMetadata(userId, {
                publicMetadata: {
                    ...metadata,
                    daily_queries: currentCount + 1,
                    last_query_date: today
                }
            });

            // --- CHAT HISTORY LOGIC ---
            // 1. Create chat if not exists
            if (!chatId) {
                const { data: newChat, error: chatError } = await supabaseAdmin
                    .from('chats')
                    .insert({
                        user_id: userId,
                        title: message.substring(0, 50) + '...' // Initial title from first message
                    })
                    .select()
                    .single();

                if (!chatError && newChat) {
                    chatId = newChat.id;
                } else {
                    console.error("Error creating chat:", chatError);
                }
            }

            // 2. Save User Message
            if (chatId) {
                await supabaseAdmin.from('messages').insert({
                    chat_id: chatId,
                    role: 'user',
                    content: message
                });
            }
        }

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
        let modelName = "gemini-2.5-flash";
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

**✈️ RESTRICCIÓN DE DOMINIO Y RESPUESTA DIRECTA:**
* Respondes **ÚNICAMENTE** preguntas sobre aviación civil, regulaciones aeronáuticas, procedimientos de vuelo, licencias, certificaciones, operaciones aéreas, navegación, meteorología aeronáutica y planificación de vuelo.
* Si la pregunta **NO** es sobre aviación, responde cortésmente que solo cubres temas aeronáuticos.

**📜 INSTRUCCIONES TÉCNICAS:**
* **VE DIRECTO AL PUNTO:** No saludes, no des bienvenidas.
* Proporciona la información técnica más precisa y **completa posible**.
* **EXTRAE Y PRESENTA DATOS ESPECÍFICOS:** números, valores, límites, velocidades, altitudes, rangos, etc.
* **NUNCA** digas "según especificado en [documento]" sin dar los valores concretos.
* Utiliza terminología aeronáutica estándar.
* Responde **SOLO en ESPAÑOL**.

**📝 FORMATO DE RESPUESTA:**
* Sin saludos ni encabezados.
* Presenta la información técnica con negritas para datos clave.
* Usa listados (viñetas) o tablas cuando sea apropiado.
* **NO** uses listas numeradas (1, 2, 3) para la estructura principal.
* **NO** incluyas una sección de "Fuentes" al final.

**💡 GUÍA DE OPTIMIZACIÓN:**
* Da SIEMPRE la mejor respuesta técnica posible.
* Si tienes información parcial, úsala para orientar técnicamente.`
                : `You are OACI.ai, a technical assistant specialized EXCLUSIVELY in international civil aviation regulations. Your goal is to provide accurate, complete, and didactic technical information.

**✈️ DOMAIN RESTRICTION AND DIRECT RESPONSE:**
* You respond **ONLY** to questions about civil aviation, aeronautical regulations, flight procedures, licenses, certifications, air operations, navigation, aviation meteorology, and flight planning.
* If the question is **NOT** about aviation, politely state you only cover aviation topics.

**📜 TECHNICAL INSTRUCTIONS:**
* **GET STRAIGHT TO THE POINT:** No greetings, no welcomes.
* Provide the most accurate and **complete technical information possible**.
* **EXTRACT AND PRESENT SPECIFIC DATA:** numbers, values, limits, speeds, altitudes, ranges, etc.
* **NEVER** say "as specified in [document]" without giving the concrete values.
* Use standard aeronautical terminology.
* Answer **ONLY in ENGLISH**.

**📝 RESPONSE FORMAT:**
* No greetings or headers.
* Present technical information with bold for key data.
* Use lists (bullets) or tables when appropriate.
* **DO NOT** use numbered lists (1, 2, 3) for the main structure.
* **DO NOT** include a "Sources" section at the end.

**💡 OPTIMIZATION GUIDE:**
* ALWAYS provide the best technical answer possible.
* If you have partial information, use it to provide technical guidance.`;

            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const chat = model.startChat({
                history: [
                    { role: "user", parts: [{ text: systemPrompt }] },
                    { role: "model", parts: [{ text: enforcedLocale === 'es' ? "Entendido. Proporcionaré información técnica precisa." : "Understood. I will provide accurate technical information." }] },
                ],
            });

            try {
                streamResult = await chat.sendMessageStream(message);
                modelName = "gemini-2.5-flash";
            } catch (error) {
                // Fallback to gemini-pro if 2.0 fails
                console.log("Falling back to gemini-2.5-pro...");
                const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
                const fallbackChat = fallbackModel.startChat({
                    history: [
                        { role: "user", parts: [{ text: systemPrompt }] },
                        { role: "model", parts: [{ text: enforcedLocale === 'es' ? "Entendido. Proporcionaré información técnica precisa." : "Understood. I will provide accurate technical information." }] },
                    ],
                });
                streamResult = await fallbackChat.sendMessageStream(message);
                modelName = "gemini-2.5-pro";
            }
            sourceLabel = "AI Generated (Verify with Official Docs)";
        }

        // Create a streaming response
        const encoder = new TextEncoder();
        let fullResponse = ""; // Accumulator for full response

        const stream = new ReadableStream({
            async start(controller) {
                try {
                    // 1. Send Metadata Chunk
                    const metadata = {
                        type: 'metadata',
                        sources: sources,
                        source: sourceLabel,
                        model: modelName,
                        chatId: chatId // Return chatId to frontend
                    };
                    controller.enqueue(encoder.encode(JSON.stringify(metadata) + '\n'));

                    // 2. Stream Text Chunks
                    for await (const chunk of streamResult.stream) {
                        const chunkText = chunk.text();
                        if (chunkText) {
                            fullResponse += chunkText; // Accumulate
                            const data = {
                                type: 'chunk',
                                text: chunkText
                            };
                            controller.enqueue(encoder.encode(JSON.stringify(data) + '\n'));
                        }
                    }

                    // 3. Save Assistant Response (After stream completes)
                    if (userId && chatId && fullResponse) {
                        await supabaseAdmin.from('messages').insert({
                            chat_id: chatId,
                            role: 'assistant',
                            content: fullResponse
                        });
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
