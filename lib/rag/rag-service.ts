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

export async function queryRAG(question: string, locale: string = 'es', jurisdiction: 'ICAO' | 'ARG' = 'ICAO'): Promise<RAGResult> {
    try {
        // 1. Generar embedding de la pregunta
        const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
        const questionEmbedding = await embeddingModel.embedContent(question);

        // 2. Buscar en Pinecone
        // Nota: Idealmente filtraríamos por metadata.jurisdiction, pero por ahora recuperamos todo
        // y dejamos que el LLM priorice según el contexto.
        const index = pinecone.index('oaci-docs');
        const searchResults = await index.query({
            vector: questionEmbedding.embedding.values,
            topK: 8, // Aumentamos a 8 para tener más contexto mixto
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
        let systemPrompt = '';

        if (locale === 'es') {
            systemPrompt = `Eres OACI.ai, un asistente experto en regulaciones de aviación civil.
    
CONTEXTO DE DOCUMENTOS (${jurisdiction === 'ARG' ? 'PRIORIDAD: REGULACIONES ARGENTINAS' : 'NORMATIVA OACI'}):
${context}

INSTRUCCIONES CRÍTICAS:
1. Responde EXCLUSIVAMENTE basándote en el contexto proporcionado.
2. JURISDICCIÓN SELECCIONADA: ${jurisdiction === 'ARG' ? 'ARGENTINA (RAAC)' : 'INTERNACIONAL (OACI)'}.
   ${jurisdiction === 'ARG'
                    ? '- Si hay conflicto entre OACI y RAAC, DA PRIORIDAD A LAS RAAC (Regulaciones Argentinas).\n   - Si la información solo está en OACI, úsala pero aclara que es normativa internacional.'
                    : '- Basa tus respuestas en los Anexos y Documentos de la OACI.'}
3. SIEMPRE cita la fuente exacta (Ej: "RAAC 91.105" o "Anexo 6, Cap 4").
4. Sé claro, directo y profesional.
5. Responde SOLO en ESPAÑOL.
6. USA FORMATO MARKDOWN:
   - **Negritas** para la respuesta directa inicial y puntos clave
   - Listas numeradas o con viñetas para explicaciones
   - Formato claro y estructurado

FORMATO DE RESPUESTA:
1. **RESPUESTA DIRECTA** (1-2 líneas en negritas)
2. EXPLICACIÓN DETALLADA (usa listas si es apropiado)
3. **FUENTE:** (cita exacta del documento)`;
        } else {
            // English prompt
            systemPrompt = `You are OACI.ai. Selected Jurisdiction: ${jurisdiction}.
            
CONTEXT:
${context}

INSTRUCTIONS:
1. Answer ONLY based on context.
2. If Jurisdiction is ARG, prioritize RAAC documents.
3. Cite sources exactly.
4. Answer in ENGLISH.
5. USE MARKDOWN FORMAT:
   - **Bold** for direct answer and key points
   - Numbered or bulleted lists for explanations
   - Clear, structured format

RESPONSE FORMAT:
1. **DIRECT ANSWER** (1-2 lines in bold)
2. DETAILED EXPLANATION (use lists if appropriate)
3. **SOURCE:** (exact document citation)`;
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro-preview-03-25' });
        const chat = model.startChat({
            history: [
                { role: 'user', parts: [{ text: systemPrompt }] },
                { role: 'model', parts: [{ text: 'Entendido. Procederé según la jurisdicción y documentos proporcionados.' }] }
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
