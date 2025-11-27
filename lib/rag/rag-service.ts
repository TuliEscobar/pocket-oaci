import { GoogleGenerativeAI } from '@google/generative-ai';
import { Pinecone } from '@pinecone-database/pinecone';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || '' });

export interface RAGSource {
    text: string;
    source: string;
    section?: string;
    chapter?: string;
    score: number;
}

export interface RAGResult {
    answer?: string;
    stream?: any; // GenerateContentStreamResult
    sources: RAGSource[];
    model: string;
}

export async function queryRAG(question: string, locale: string = 'es', jurisdiction: 'ICAO' | 'ARG' = 'ICAO'): Promise<RAGResult> {
    try {
        console.log(`[RAG] Starting query for: "${question}" (Jurisdiction: ${jurisdiction})`);
        const startTime = Date.now();

        // 1. Generar embedding de la pregunta
        console.time('[RAG] Embedding Generation');
        const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
        const questionEmbedding = await embeddingModel.embedContent(question);
        console.timeEnd('[RAG] Embedding Generation');

        // 2. Buscar en Pinecone con más contexto para respuestas completas
        console.time('[RAG] Pinecone Query');
        const index = pinecone.index('oaci-docs');
        const searchResults = await index.query({
            vector: questionEmbedding.embedding.values,
            topK: 8, // Reducido a 8 para mejorar latencia
            includeMetadata: true
        });
        console.timeEnd('[RAG] Pinecone Query');

        // 3. Extraer contexto relevante
        const sources: RAGSource[] = searchResults.matches.map(match => ({
            text: (match.metadata?.text as string) || '',
            source: (match.metadata?.source as string) || '',
            section: match.metadata?.section as string,
            chapter: match.metadata?.chapter as string,
            score: match.score || 0
        }));

        const context = sources
            .map((s, i) => `[Fragmento ${i + 1} - ${s.source}${s.section ? `, Sección ${s.section}` : ''}]\n${s.text}`)
            .join('\n\n---\n\n');

        // 4. Generar respuesta con contexto
        let systemPrompt = '';

        if (locale === 'es') {
            systemPrompt = `Eres OACI.ai, un asistente experto y amigable en regulaciones de aviación civil. Tu objetivo es ayudar a pilotos, estudiantes y profesionales de aviación a entender las regulaciones de forma clara y completa.

CONTEXTO DE DOCUMENTOS (${jurisdiction === 'ARG' ? 'PRIORIDAD: REGULACIONES ARGENTINAS' : 'NORMATIVA OACI'}):
${context}

INSTRUCCIONES CRÍTICAS:

1. **COMPRENSIÓN DE LA PREGUNTA:**
   - Si preguntan "qué necesito para ser [rol]", busca TODOS los requisitos: experiencia, edad, médico, exámenes, etc.
   - Si preguntan sobre un procedimiento, explica el proceso completo paso a paso
   - Interpreta la intención real de la pregunta, no solo las palabras literales

2. **JURISDICCIÓN SELECCIONADA: ${jurisdiction === 'ARG' ? 'ARGENTINA (RAAC)' : 'INTERNACIONAL (OACI)'}**
   ${jurisdiction === 'ARG'
                    ? '- DA PRIORIDAD ABSOLUTA a las RAAC (Regulaciones Argentinas)\n   - Si encuentras información relevante en RAAC, úsala primero\n   - Solo menciona OACI si RAAC no cubre el tema, y acláralo'
                    : '- Basa tus respuestas en los Anexos y Documentos de la OACI\n   - Cita siempre el Anexo o Documento específico'}

3. **TONO CONVERSACIONAL:**
   - Sé amigable y profesional, como un instructor experimentado
   - Usa un lenguaje claro y accesible, evita jerga innecesaria
   - Si la respuesta es positiva (hay información clara), comienza con confianza
   - Ejemplo: "Para ser controlador aéreo en Argentina, necesitás cumplir con..." en lugar de "Según las regulaciones..."

4. **RESPUESTAS COMPLETAS:**
   - NO te limites a una sola parte de la respuesta
   - Si preguntan requisitos, lista TODOS los que encuentres en el contexto
   - Organiza la información de forma lógica (por ejemplo: requisitos de edad, médicos, experiencia, exámenes)
   - Si hay múltiples aspectos, cúbrelos todos

5. **FORMATO MARKDOWN:**
   - **Negritas** para la respuesta directa inicial y requisitos clave
   - Listas numeradas para pasos o requisitos múltiples
   - Listas con viñetas para características o detalles
   - Usa subtítulos (###) si hay múltiples secciones

6. **FUENTES:**
   - SIEMPRE cita la fuente exacta al final
   - Formato: "**Fuente:** RAAC 91.105" o "**Fuente:** Anexo 6, Capítulo 4"
   - Si usas múltiples fragmentos, menciona todas las fuentes relevantes

FORMATO DE RESPUESTA:
1. **RESPUESTA DIRECTA Y POSITIVA** (1-2 líneas en negritas, tono amigable)
2. **EXPLICACIÓN COMPLETA Y DETALLADA:**
   - Organiza por categorías si hay múltiples aspectos
   - Usa listas para claridad
   - Incluye todos los detalles relevantes del contexto
3. **FUENTE:** (cita exacta del documento)

IMPORTANTE: Si encuentras información relevante en el contexto, responde con CONFIANZA y de forma COMPLETA. No seas vago ni parcial.`;
        } else {
            // English prompt
            systemPrompt = `You are OACI.ai, a friendly and expert assistant in civil aviation regulations. Your goal is to help pilots, students, and aviation professionals understand regulations clearly and completely.

CONTEXT:
${context}

CRITICAL INSTRUCTIONS:

1. **QUESTION UNDERSTANDING:**
   - If asked "what do I need to be [role]", find ALL requirements: experience, age, medical, exams, etc.
   - If asked about a procedure, explain the complete process step by step
   - Interpret the real intent of the question, not just literal words

2. **SELECTED JURISDICTION: ${jurisdiction}**
   ${jurisdiction === 'ARG'
                    ? '- Give ABSOLUTE PRIORITY to RAAC (Argentine Regulations)\n   - If you find relevant information in RAAC, use it first\n   - Only mention ICAO if RAAC doesn\'t cover the topic, and clarify it'
                    : '- Base your answers on ICAO Annexes and Documents\n   - Always cite the specific Annex or Document'}

3. **CONVERSATIONAL TONE:**
   - Be friendly and professional, like an experienced instructor
   - Use clear and accessible language, avoid unnecessary jargon
   - If the answer is positive (clear information), start with confidence
   - Example: "To become an air traffic controller, you need to..." instead of "According to regulations..."

4. **COMPLETE ANSWERS:**
   - DO NOT limit yourself to one part of the answer
   - If asked about requirements, list ALL that you find in the context
   - Organize information logically (e.g., age requirements, medical, experience, exams)
   - If there are multiple aspects, cover them all

5. **MARKDOWN FORMAT:**
   - **Bold** for direct answer and key requirements
   - Numbered lists for steps or multiple requirements
   - Bullet lists for features or details
   - Use subheadings (###) if there are multiple sections

6. **SOURCES:**
   - ALWAYS cite the exact source at the end
   - Format: "**Source:** RAAC 91.105" or "**Source:** Annex 6, Chapter 4"
   - If using multiple fragments, mention all relevant sources

RESPONSE FORMAT:
1. **DIRECT AND POSITIVE ANSWER** (1-2 lines in bold, friendly tone)
2. **COMPLETE AND DETAILED EXPLANATION:**
   - Organize by categories if there are multiple aspects
   - Use lists for clarity
   - Include all relevant details from context
3. **SOURCE:** (exact document citation)

IMPORTANT: If you find relevant information in the context, respond with CONFIDENCE and COMPLETELY. Don't be vague or partial.`;
        }

        console.time('[RAG] LLM Initialization');
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        const chat = model.startChat({
            history: [
                { role: 'user', parts: [{ text: systemPrompt }] },
                { role: 'model', parts: [{ text: 'Entendido. Procederé según la jurisdicción y documentos proporcionados.' }] }
            ]
        });

        // Use sendMessageStream instead of sendMessage
        const result = await chat.sendMessageStream(question);
        console.timeEnd('[RAG] LLM Initialization');

        const totalTime = Date.now() - startTime;
        console.log(`[RAG] Setup execution time: ${totalTime}ms`);

        // 5. Retornar stream y fuentes
        return {
            stream: result,
            sources: sources,
            model: 'gemini-2.0-flash-exp + RAG'
        };

    } catch (error: any) {
        console.error('RAG Error:', error);
        throw new Error(`RAG Service Error: ${error.message}`);
    }
}

// Función auxiliar para verificar si el RAG está configurado
export async function isRAGConfigured(): Promise<boolean> {
    try {
        if (!process.env.PINECONE_API_KEY) return false;

        const existingIndexes = await pinecone.listIndexes();
        return existingIndexes.indexes?.some(idx => idx.name === 'oaci-docs') || false;
    } catch {
        return false;
    }
}
