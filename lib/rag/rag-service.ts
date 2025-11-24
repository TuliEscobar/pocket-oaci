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
    answer: string;
    sources: RAGSource[];
    model: string;
}

export async function queryRAG(question: string, locale: string = 'es'): Promise<RAGResult> {
    try {
        // 1. Generar embedding de la pregunta
        const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
        const questionEmbedding = await embeddingModel.embedContent(question);

        // 2. Buscar en Pinecone
        const index = pinecone.index('oaci-docs');
        const searchResults = await index.query({
            vector: questionEmbedding.embedding.values,
            topK: 5, // Top 5 resultados más relevantes
            includeMetadata: true
        });

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
        const systemPrompt = locale === 'es'
            ? `Eres OACI.ai, un asistente experto en regulaciones de aviación civil internacional.
    
CONTEXTO DE DOCUMENTOS OFICIALES DE LA OACI:
${context}

INSTRUCCIONES CRÍTICAS:
1. Responde EXCLUSIVAMENTE basándote en el contexto proporcionado arriba.
2. Si la información no está en el contexto, responde: "No encuentro esta información específica en los documentos disponibles actualmente."
3. SIEMPRE cita la fuente exacta al final de tu respuesta (Anexo/Doc, Sección si está disponible).
4. Sé claro, directo y profesional.
5. Usa terminología aeronáutica correcta.
6. Responde SOLO en ESPAÑOL.

FORMATO DE RESPUESTA:
1. RESPUESTA DIRECTA (1-2 líneas en negritas)
2. EXPLICACIÓN DETALLADA
3. FUENTE (Ejemplo: "Fuente: Anexo 6, Sección 4.2.3")`
            : `You are OACI.ai, an expert in international civil aviation regulations.
    
OFFICIAL ICAO DOCUMENTS CONTEXT:
${context}

CRITICAL INSTRUCTIONS:
1. Answer EXCLUSIVELY based on the context provided above.
2. If information is not in context, respond: "I cannot find this specific information in currently available documents."
3. ALWAYS cite exact source at end of response (Annex/Doc, Section if available).
4. Be clear, direct, and professional.
5. Use correct aeronautical terminology.
6. Answer ONLY in ENGLISH.

RESPONSE FORMAT:
1. DIRECT ANSWER (1-2 lines in bold)
2. DETAILED EXPLANATION
3. SOURCE (Example: "Source: Annex 6, Section 4.2.3")`;

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro-preview-03-25' });
        const chat = model.startChat({
            history: [
                { role: 'user', parts: [{ text: systemPrompt }] },
                { role: 'model', parts: [{ text: locale === 'es' ? 'Entendido. Responderé basándome exclusivamente en los documentos OACI proporcionados.' : 'Understood. I will answer based exclusively on the provided ICAO documents.' }] }
            ]
        });

        const result = await chat.sendMessage(question);

        // 5. Retornar respuesta con fuentes
        return {
            answer: result.response.text(),
            sources: sources,
            model: 'gemini-2.5-pro-preview-03-25 + RAG'
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
