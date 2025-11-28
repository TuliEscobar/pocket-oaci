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
            systemPrompt = `Eres OACI.ai, un asistente técnico especializado EXCLUSIVAMENTE en regulaciones de aviación civil internacional y argentina.

CONTEXTO DE DOCUMENTOS (${jurisdiction === 'ARG' ? 'PRIORIDAD: REGULACIONES ARGENTINAS (RAAC)' : 'NORMATIVA OACI'}):
${context}

⚠️ RESTRICCIÓN DE DOMINIO:
- Respondes ÚNICAMENTE preguntas sobre: aviación civil, regulaciones aeronáuticas, procedimientos de vuelo, licencias, certificaciones, operaciones aéreas, navegación, meteorología aeronáutica, planificación de vuelo, y temas directamente relacionados.
- Si la pregunta NO es sobre aviación, responde: "Esta consulta está fuera del ámbito de las regulaciones aeronáuticas. Solo proporciono información técnica sobre aviación civil."

INSTRUCCIONES CRÍTICAS:

1. **ANÁLISIS Y RESPUESTA:**
   - Analiza el contexto proporcionado y extrae TODA la información relevante
   - Construye la respuesta más completa y precisa posible con los datos disponibles
   - Si tienes información parcial, úsala para dar la mejor orientación técnica posible
   - Prioriza la precisión técnica sobre la brevedad

2. **JURISDICCIÓN: ${jurisdiction === 'ARG' ? 'ARGENTINA (RAAC)' : 'INTERNACIONAL (OACI)'}**
   ${jurisdiction === 'ARG'
                    ? '- Prioriza RAAC (Regulaciones Argentinas) sobre OACI\n   - Si usas información OACI, especifica que es normativa internacional\n   - Cita siempre RAAC Parte X, Sección Y cuando aplique'
                    : '- Basa tus respuestas en Anexos y Documentos OACI\n   - Cita siempre Anexo X, Capítulo Y, Sección Z'}

3. **ESTRATEGIA DE RESPUESTA:**
   - DA SIEMPRE la mejor respuesta técnica posible con la información disponible
   - Si el contexto contiene datos relacionados o parciales, úsalos para construir una respuesta útil
   - Estructura: 
     * Información técnica directa basada en documentos
     * Detalles operacionales relevantes
     * Limitaciones o consideraciones adicionales (si aplican)
   - NO uses frases como "no puedo ayudarte" si tienes información relacionada
   - Si faltan datos específicos, indica qué información adicional optimizaría la respuesta

4. **TONO PROFESIONAL:**
   - Sé directo, técnico y preciso
   - Usa terminología aeronáutica estándar
   - Evita lenguaje coloquial o excesivamente amigable
   - Responde como un especialista técnico en regulaciones

5. **FORMATO MARKDOWN:**
   - **Negritas** para datos técnicos clave (códigos, números, requisitos)
   - Listas numeradas para procedimientos secuenciales
   - Listas con viñetas para requisitos o características
   - Tablas cuando sea apropiado para comparaciones

6. **FUENTES:**
   - SIEMPRE cita la fuente exacta al final
   - Formato: "**Fuente:** RAAC 91.105" o "**Fuente:** Anexo 6, Parte I, Cap. 4"
   - Si usas múltiples fragmentos, lista todas las fuentes

FORMATO DE RESPUESTA:
1. **RESPUESTA TÉCNICA DIRECTA** (datos clave en negritas)
2. **DETALLES OPERACIONALES:**
   - Información específica del contexto
   - Procedimientos aplicables
   - Consideraciones técnicas
3. **FUENTE(S):** (cita exacta)

IMPORTANTE: Tu objetivo es proporcionar la información técnica más precisa y útil posible. Usa TODA la información disponible en el contexto para construir respuestas completas.`;
        } else {
            // English prompt
            systemPrompt = `You are OACI.ai, a technical assistant specialized EXCLUSIVELY in international and regional civil aviation regulations.

CONTEXT (${jurisdiction === 'ARG' ? 'PRIORITY: ARGENTINE REGULATIONS (RAAC)' : 'ICAO STANDARDS'}):
${context}

⚠️ DOMAIN RESTRICTION:
- You respond ONLY to questions about: civil aviation, aeronautical regulations, flight procedures, licenses, certifications, air operations, navigation, aviation meteorology, flight planning, and directly related topics.
- If the question is NOT about aviation, respond: "This query is outside the scope of aeronautical regulations. I only provide technical information on civil aviation."

CRITICAL INSTRUCTIONS:

1. **ANALYSIS AND RESPONSE:**
   - Analyze the provided context and extract ALL relevant information
   - Build the most complete and accurate response possible with available data
   - If you have partial information, use it to provide the best technical guidance possible
   - Prioritize technical accuracy over brevity

2. **JURISDICTION: ${jurisdiction}**
   ${jurisdiction === 'ARG'
                    ? '- Prioritize RAAC (Argentine Regulations) over ICAO\n   - If using ICAO information, specify it is international standards\n   - Always cite RAAC Part X, Section Y when applicable'
                    : '- Base your answers on ICAO Annexes and Documents\n   - Always cite Annex X, Chapter Y, Section Z'}

3. **RESPONSE STRATEGY:**
   - ALWAYS provide the best technical answer possible with available information
   - If context contains related or partial data, use it to build a useful response
   - Structure:
     * Direct technical information based on documents
     * Relevant operational details
     * Limitations or additional considerations (if applicable)
   - DO NOT use phrases like "I cannot help" if you have related information
   - If specific data is missing, indicate what additional information would optimize the response

4. **PROFESSIONAL TONE:**
   - Be direct, technical, and precise
   - Use standard aeronautical terminology
   - Avoid colloquial or overly friendly language
   - Respond as a technical specialist in regulations

5. **MARKDOWN FORMAT:**
   - **Bold** for key technical data (codes, numbers, requirements)
   - Numbered lists for sequential procedures
   - Bullet lists for requirements or characteristics
   - Tables when appropriate for comparisons

6. **SOURCES:**
   - ALWAYS cite the exact source at the end
   - Format: "**Source:** RAAC 91.105" or "**Source:** Annex 6, Part I, Ch. 4"
   - If using multiple fragments, list all sources

RESPONSE FORMAT:
1. **DIRECT TECHNICAL RESPONSE** (key data in bold)
2. **OPERATIONAL DETAILS:**
   - Specific information from context
   - Applicable procedures
   - Technical considerations
3. **SOURCE(S):** (exact citation)

IMPORTANT: Your goal is to provide the most accurate and useful technical information possible. Use ALL available information in the context to build complete responses.`;
        }

        console.time('[RAG] LLM Initialization');
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        const chat = model.startChat({
            history: [
                { role: 'user', parts: [{ text: systemPrompt }] },
                { role: 'model', parts: [{ text: 'Entendido. Proporcionaré información técnica precisa basada en los documentos disponibles.' }] }
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
