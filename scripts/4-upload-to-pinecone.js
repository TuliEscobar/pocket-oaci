const { Pinecone } = require('@pinecone-database/pinecone');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY || '',
});

async function uploadToPinecone() {
    if (!process.env.PINECONE_API_KEY) {
        console.error('❌ Error: PINECONE_API_KEY no encontrada en .env.local');
        console.log('\n📝 Para obtener tu API key:');
        console.log('   1. Ve a https://www.pinecone.io/');
        console.log('   2. Crea una cuenta gratuita');
        console.log('   3. Obtén tu API key');
        console.log('   4. Añádela a .env.local: PINECONE_API_KEY=tu_key');
        return;
    }

    const indexName = 'oaci-docs';

    try {
        // Verificar si el índice existe
        const existingIndexes = await pinecone.listIndexes();
        const indexExists = existingIndexes.indexes?.some(idx => idx.name === indexName);

        if (!indexExists) {
            console.log('📦 Creando índice en Pinecone...');
            await pinecone.createIndex({
                name: indexName,
                dimension: 768, // text-embedding-004 dimension
                metric: 'cosine',
                spec: {
                    serverless: {
                        cloud: 'aws',
                        region: 'us-east-1'
                    }
                }
            });

            console.log('⏳ Esperando a que el índice esté listo (10 segundos)...');
            await new Promise(resolve => setTimeout(resolve, 10000));
        } else {
            console.log('✅ Índice existente encontrado');
        }

        const index = pinecone.index(indexName);

        // Cargar embeddings
        const embeddingsDir = path.join(process.cwd(), 'data', 'embeddings');

        if (!fs.existsSync(embeddingsDir)) {
            console.log('⚠️  No se encontraron embeddings en data/embeddings/');
            console.log('📝 Primero ejecuta: node scripts/3-generate-embeddings.js');
            return;
        }

        const files = fs.readdirSync(embeddingsDir).filter(f => f.endsWith('.json'));

        if (files.length === 0) {
            console.log('⚠️  No se encontraron archivos de embeddings');
            return;
        }

        console.log(`\n📤 Subiendo ${files.length} archivos a Pinecone...\n`);

        let totalVectors = 0;

        for (const file of files) {
            const filePath = path.join(embeddingsDir, file);
            const chunks = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

            console.log(`🔄 Subiendo: ${file} (${chunks.length} vectores)`);

            // Pinecone acepta hasta 100 vectores por batch
            const batchSize = 100;

            for (let i = 0; i < chunks.length; i += batchSize) {
                const batch = chunks.slice(i, i + batchSize);

                const vectors = batch.map((chunk) => ({
                    id: chunk.id,
                    values: chunk.embedding,
                    metadata: {
                        text: chunk.text.substring(0, 40000), // Pinecone metadata limit
                        source: chunk.metadata.source,
                        docType: chunk.metadata.docType,
                        docNumber: chunk.metadata.docNumber,
                        section: chunk.metadata.section || '',
                        chapter: chunk.metadata.chapter || ''
                    }
                }));

                await index.upsert(vectors);
                process.stdout.write(`   ✅ Subidos ${Math.min(i + batchSize, chunks.length)}/${chunks.length}\r`);
            }

            console.log(); // Nueva línea
            totalVectors += chunks.length;
        }

        console.log(`\n✨ Todos los vectores subidos a Pinecone!`);
        console.log(`   Total: ${totalVectors} vectores\n`);

        // Verificar estadísticas
        console.log('📊 Obteniendo estadísticas del índice...');
        const stats = await index.describeIndexStats();
        console.log(`   - Vectores totales: ${stats.totalRecordCount}`);
        console.log(`   - Dimensión: ${stats.dimension}`);
        console.log(`\n🎉 RAG Database lista para usar!`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

uploadToPinecone().catch(console.error);
