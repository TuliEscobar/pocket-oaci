import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

interface ChunkWithEmbedding {
    id: string;
    text: string;
    embedding: number[];
    metadata: any;
}

async function generateEmbedding(text: string): Promise<number[]> {
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await model.embedContent(text);
    return result.embedding.values;
}

async function processSpecificFile() {
    const chunksDir = path.join(process.cwd(), 'data', 'chunks');
    const embeddingsDir = path.join(process.cwd(), 'data', 'embeddings');

    // Archivo específico a procesar
    const targetFile = 'parte-61-23dic2014.json';

    if (!fs.existsSync(embeddingsDir)) {
        fs.mkdirSync(embeddingsDir, { recursive: true });
    }

    const filePath = path.join(chunksDir, targetFile);
    if (!fs.existsSync(filePath)) {
        console.error(`❌ Archivo no encontrado: ${targetFile}`);
        return;
    }

    const chunks = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    console.log(`\n🔄 Procesando PRIORITARIO: ${targetFile} (${chunks.length} chunks)`);

    const chunksWithEmbeddings: ChunkWithEmbedding[] = [];

    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];

        try {
            process.stdout.write(`  ${i + 1}/${chunks.length} - Generando embedding... \r`);
            const embedding = await generateEmbedding(chunk.text);

            chunksWithEmbeddings.push({
                ...chunk,
                embedding
            });

            // Rate limiting más agresivo para terminar rápido pero seguro
            await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
            console.error(`❌ Error en chunk ${chunk.id}:`, error);
        }
    }

    // Guardar
    const outputPath = path.join(embeddingsDir, targetFile);
    fs.writeFileSync(outputPath, JSON.stringify(chunksWithEmbeddings, null, 2));

    console.log(`\n✅ Guardados ${chunksWithEmbeddings.length} embeddings para ${targetFile}`);
}

processSpecificFile().catch(console.error);
