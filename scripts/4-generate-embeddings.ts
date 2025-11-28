import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
interface SparseVector {
    indices: number[];
    values: number[];
}

interface ChunkWithEmbedding {
    id: string;
    text: string;
    embedding: number[];
    sparseValues?: SparseVector;
    metadata: any;
}

// Simple hash function for sparse vector indices (MurmurHash3-like or simple DJB2)
function hashString(str: string): number {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i); /* hash * 33 + c */
    }
    return Math.abs(hash);
}

// Generate Sparse Vector (TF - Term Frequency with Hashing)
function generateSparseVector(text: string): SparseVector {
    const tokens = text.toLowerCase().split(/[\s,.-]+/);
    const tokenCounts: { [key: string]: number } = {};

    // Stopwords basic list (Spanish/English mix for aviation)
    const stopWords = new Set(['el', 'la', 'los', 'las', 'de', 'del', 'en', 'y', 'o', 'a', 'para', 'por', 'con', 'the', 'of', 'and', 'to', 'in', 'for', 'with', 'is', 'are']);

    tokens.forEach(token => {
        if (token.length > 2 && !stopWords.has(token)) {
            tokenCounts[token] = (tokenCounts[token] || 0) + 1;
        }
    });

    const indices: number[] = [];
    const values: number[] = [];
    const dim = 10000; // Dimension of sparse vector space (can be larger supported by Pinecone)

    Object.entries(tokenCounts).forEach(([token, count]) => {
        const hash = hashString(token) % dim;
        // Handle collisions simply by summing or taking max (here we just push, Pinecone sums duplicates usually or we should unique them)
        // Better to unique indices locally
        const existingIndex = indices.indexOf(hash);
        if (existingIndex !== -1) {
            values[existingIndex] += count;
        } else {
            indices.push(hash);
            values.push(count);
        }
    });

    return { indices, values };
}

async function generateEmbedding(text: string): Promise<number[]> {
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await model.embedContent(text);
    return result.embedding.values;
}

async function processChunksWithEmbeddings() {
    if (!process.env.GOOGLE_API_KEY) {
        console.error('❌ Error: GOOGLE_API_KEY no encontrada en .env.local');
        return;
    }

    const chunksDir = path.join(process.cwd(), 'data', 'chunks');
    const embeddingsDir = path.join(process.cwd(), 'data', 'embeddings');
    const processedDir = path.join(embeddingsDir, 'processed');

    if (!fs.existsSync(embeddingsDir)) {
        fs.mkdirSync(embeddingsDir, { recursive: true });
    }

    const files = fs.readdirSync(chunksDir).filter(f => f.endsWith('.json'));

    if (files.length === 0) {
        console.log('⚠️  No se encontraron chunks en data/chunks/');
        console.log('📝 Primero ejecuta: npx ts-node scripts/3-chunk-text.ts');
        return;
    }

    console.log(`🧮 Generando embeddings para ${files.length} archivos...\n`);

    let totalEmbeddings = 0;

    for (const file of files) {
        // Verificar si ya existe en embeddings o en processed
        const existingOutputPath = path.join(embeddingsDir, file); // Same extension .json
        const processedPath = path.join(processedDir, file);

        if (fs.existsSync(existingOutputPath) || fs.existsSync(processedPath)) {
            console.log(`⏩ Saltando ${file} (ya procesado)`);
            continue;
        }

        const filePath = path.join(chunksDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const chunks = JSON.parse(fileContent);

        console.log(`🔄 Procesando: ${file} (${chunks.length} chunks)`);

        const chunksWithEmbeddings: ChunkWithEmbedding[] = [];

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];

            try {
                process.stdout.write(`   ${i + 1}/${chunks.length} - Generando embedding... `);
                const embedding = await generateEmbedding(chunk.text);

                const sparseValues = generateSparseVector(chunk.text);

                chunksWithEmbeddings.push({
                    ...chunk,
                    embedding,
                    sparseValues
                });

                console.log('✅');

                // Rate limiting: esperar 1 segundo entre requests para evitar límites de API
                if (i < chunks.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }

            } catch (error: any) {
                console.log('❌');
                console.error(`   Error en chunk ${chunk.id}:`, error.message);
            }
        }

        // Guardar como JSON
        const outputPath = path.join(embeddingsDir, file);
        fs.writeFileSync(outputPath, JSON.stringify(chunksWithEmbeddings, null, 2));

        console.log(`   💾 Guardados ${chunksWithEmbeddings.length} embeddings\n`);
        totalEmbeddings += chunksWithEmbeddings.length;
    }

    console.log(`✨ Total: ${totalEmbeddings} embeddings generados!\n`);
    console.log('📁 Embeddings guardados en: data/embeddings/');
    console.log('\n📊 Estadísticas:');
    console.log(`   - Dimensión de vectores: 768 (text-embedding-004)`);
    console.log(`   - Total de vectores: ${totalEmbeddings}`);
}

processChunksWithEmbeddings().catch(console.error);
