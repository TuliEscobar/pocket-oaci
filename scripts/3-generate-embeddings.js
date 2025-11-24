const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

async function generateEmbedding(text) {
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

    if (!fs.existsSync(embeddingsDir)) {
        fs.mkdirSync(embeddingsDir, { recursive: true });
    }

    const files = fs.readdirSync(chunksDir).filter(f => f.endsWith('.json'));

    if (files.length === 0) {
        console.log('⚠️  No se encontraron chunks en data/chunks/');
        console.log('📝 Primero ejecuta: node scripts/2-chunk-text.js');
        return;
    }

    console.log(`🧮 Generando embeddings para ${files.length} archivos...\n`);

    let totalEmbeddings = 0;

    for (const file of files) {
        const filePath = path.join(chunksDir, file);
        const chunks = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        console.log(`🔄 Procesando: ${file} (${chunks.length} chunks)`);
        console.log(`   ⏱️  Tiempo estimado: ~${Math.ceil(chunks.length / 60)} minutos (con rate limiting)\n`);

        const chunksWithEmbeddings = [];

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];

            try {
                process.stdout.write(`   ${i + 1}/${chunks.length} - Generando embedding... `);
                const embedding = await generateEmbedding(chunk.text);

                chunksWithEmbeddings.push({
                    ...chunk,
                    embedding
                });

                console.log('✅');

                // Rate limiting: esperar 1 segundo entre requests para evitar límites de API
                if (i < chunks.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }

            } catch (error) {
                console.log('❌');
                console.error(`   Error en chunk ${chunk.id}:`, error.message);
            }
        }

        // Guardar
        const outputPath = path.join(embeddingsDir, file);
        fs.writeFileSync(outputPath, JSON.stringify(chunksWithEmbeddings, null, 2));

        console.log(`\n   💾 Guardados ${chunksWithEmbeddings.length} embeddings\n`);
        totalEmbeddings += chunksWithEmbeddings.length;
    }

    console.log(`✨ Total: ${totalEmbeddings} embeddings generados!\n`);
    console.log('📁 Embeddings guardados en: data/embeddings/');
    console.log('\n📊 Estadísticas:');
    console.log(`   - Dimensión de vectores: 768 (text-embedding-004)`);
    console.log(`   - Total de vectores: ${totalEmbeddings}`);
}

processChunksWithEmbeddings().catch(console.error);
