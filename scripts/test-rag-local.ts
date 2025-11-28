import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

interface ChunkWithEmbedding {
    id: string;
    text: string;
    embedding: number[];
    metadata: {
        source: string;
        docType: string;
        docNumber: string;
        section?: string;
        chapter?: string;
    };
}

// Calcular similitud coseno entre dos vectores
function cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
}

// Generar embedding para una consulta
async function generateQueryEmbedding(query: string): Promise<number[]> {
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await model.embedContent(query);
    return result.embedding.values;
}

// Cargar todos los embeddings
function loadAllEmbeddings(): ChunkWithEmbedding[] {
    const embeddingsDir = path.join(process.cwd(), 'data', 'embeddings');
    const files = fs.readdirSync(embeddingsDir).filter(f => f.endsWith('.json'));

    const allChunks: ChunkWithEmbedding[] = [];

    for (const file of files) {
        const filePath = path.join(embeddingsDir, file);
        const chunks = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as ChunkWithEmbedding[];
        allChunks.push(...chunks);
    }

    return allChunks;
}

// Buscar chunks más relevantes
function searchRelevantChunks(
    queryEmbedding: number[],
    allChunks: ChunkWithEmbedding[],
    topK: number = 5
): Array<ChunkWithEmbedding & { score: number }> {
    const scored = allChunks.map(chunk => ({
        ...chunk,
        score: cosineSimilarity(queryEmbedding, chunk.embedding)
    }));

    // Ordenar por score descendente
    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, topK);
}

// Generar respuesta con contexto
async function generateAnswer(query: string, context: string): Promise<string> {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `Eres un asistente experto en regulaciones aeronáuticas de Argentina (RAAC) e ICAO.

Contexto relevante de los documentos:
${context}

Pregunta del usuario: ${query}

Instrucciones:
- Responde de forma clara, precisa y profesional
- Usa SOLO la información del contexto proporcionado
- Si la información no está en el contexto, indícalo claramente
- Cita las fuentes cuando sea relevante (nombre del documento)
- Sé conciso pero completo

Respuesta:`;

    const result = await model.generateContent(prompt);
    return result.response.text();
}

async function testRAG() {
    console.log('🔍 Sistema de prueba RAG Local\n');

    // Verificar que existan embeddings
    const embeddingsDir = path.join(process.cwd(), 'data', 'embeddings');
    if (!fs.existsSync(embeddingsDir)) {
        console.error('❌ No se encontraron embeddings. Ejecuta primero: npx ts-node scripts/4-generate-embeddings.ts');
        return;
    }

    // Pregunta de prueba (puedes cambiarla)
    const query = process.argv[2] || '¿Cuál es la ruta UL793 y qué puntos conecta?';

    console.log(`📝 Pregunta: "${query}"\n`);

    // 1. Cargar embeddings
    console.log('📂 Cargando embeddings...');
    const allChunks = loadAllEmbeddings();
    console.log(`   ✅ Cargados ${allChunks.length} chunks\n`);

    // 2. Generar embedding de la consulta
    console.log('🧮 Generando embedding de la consulta...');
    const queryEmbedding = await generateQueryEmbedding(query);
    console.log('   ✅ Embedding generado\n');

    // 3. Buscar chunks relevantes
    console.log('🔎 Buscando chunks relevantes...');
    const topK = 5;
    const relevantChunks = searchRelevantChunks(queryEmbedding, allChunks, topK);
    console.log(`   ✅ Encontrados ${relevantChunks.length} chunks relevantes\n`);

    // Mostrar resultados
    console.log('📊 Chunks más relevantes:\n');
    relevantChunks.forEach((chunk, i) => {
        console.log(`${i + 1}. Score: ${chunk.score.toFixed(4)} | Fuente: ${chunk.metadata.source}`);
        console.log(`   Texto: ${chunk.text.substring(0, 150)}...\n`);
    });

    // 4. Generar contexto
    const context = relevantChunks
        .map(chunk => `[${chunk.metadata.source}]\n${chunk.text}`)
        .join('\n\n---\n\n');

    // 5. Generar respuesta
    console.log('🤖 Generando respuesta...\n');
    const answer = await generateAnswer(query, context);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💬 RESPUESTA:\n');
    console.log(answer);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Mostrar fuentes
    console.log('\n📚 Fuentes consultadas:');
    const uniqueSources = [...new Set(relevantChunks.map(c => c.metadata.source))];
    uniqueSources.forEach(source => console.log(`   - ${source}`));
}

// Ejecutar
testRAG().catch(console.error);
