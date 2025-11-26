
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY || '',
});

const indexName = 'oaci-docs';

async function verifyCPDLC() {
    if (!process.env.GOOGLE_API_KEY || !process.env.PINECONE_API_KEY) {
        console.error('❌ Error: API keys no encontradas en .env.local');
        return;
    }

    const query = "Háblame sobre el Capítulo 14 del PROGEN ATM referente a COMUNICACIONES POR ENLACE DE DATOS CONTROLADOR-PILOTO (CPDLC)";
    console.log(`🔍 Pregunta: "${query}"\n`);

    try {
        // 1. Generar embedding de la consulta
        console.log('🧮 Generando embedding de la consulta...');
        const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
        const result = await model.embedContent(query);
        const queryVector = result.embedding.values;

        // 2. Consultar Pinecone
        console.log('🌲 Consultando Pinecone...');
        const index = pinecone.index(indexName);
        const queryResponse = await index.query({
            vector: queryVector,
            topK: 5,
            includeMetadata: true
        });

        // 3. Mostrar resultados
        console.log('\n📊 Resultados encontrados:\n');

        if (queryResponse.matches && queryResponse.matches.length > 0) {
            queryResponse.matches.forEach((match, i) => {
                const metadata = match.metadata as any;
                console.log(`Result ${i + 1}:`);
                console.log(`   Score: ${match.score?.toFixed(4)}`);
                console.log(`   Source: ${metadata.source}`);
                console.log(`   Chapter: ${metadata.chapter || 'N/A'}`);
                console.log(`   Section: ${metadata.section || 'N/A'}`);
                console.log(`   Text snippet: ${metadata.text.substring(0, 150)}...`);
                console.log('-----------------------------------');
            });

            // Verificación específica
            const hasProgenATM = queryResponse.matches.some(m => (m.metadata as any).source.includes('PROGEN ATM'));
            const hasChapter14 = queryResponse.matches.some(m => (m.metadata as any).text.includes('Capítulo 14') || (m.metadata as any).chapter === '14');

            console.log('\n✨ Verificación:');
            console.log(`   - Contiene PROGEN ATM: ${hasProgenATM ? '✅ SÍ' : '❌ NO'}`);
            console.log(`   - Relacionado con Capítulo 14/CPDLC: ${hasChapter14 ? '✅ SÍ' : '⚠️  Revisar contenido'}`);

        } else {
            console.log('❌ No se encontraron coincidencias.');
        }

    } catch (error: any) {
        console.error('❌ Error:', error.message);
    }
}

verifyCPDLC().catch(console.error);
