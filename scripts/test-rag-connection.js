const { queryRAG, isRAGConfigured } = require('../lib/rag/rag-service.ts');
require('dotenv').config({ path: '.env.local' });

async function testRAGConnection() {
    console.log('🧪 Testing RAG Connection...\n');

    // 1. Verificar configuración
    console.log('1️⃣ Checking RAG configuration...');
    const configured = await isRAGConfigured();
    console.log(`   RAG Configured: ${configured ? '✅ YES' : '❌ NO'}\n`);

    if (!configured) {
        console.log('⚠️  RAG is not configured. Check:');
        console.log('   - PINECONE_API_KEY in .env.local');
        console.log('   - Pinecone index "oaci-docs" exists');
        return;
    }

    // 2. Test query
    console.log('2️⃣ Testing RAG query...');
    const testQuestion = '¿Qué es la gestión del tráfico aéreo?';
    console.log(`   Question: "${testQuestion}"\n`);

    try {
        const result = await queryRAG(testQuestion, 'es');

        console.log('✅ RAG Query Successful!\n');
        console.log('📝 Answer:');
        console.log('   ' + result.answer.substring(0, 300) + '...\n');

        console.log('📚 Sources:');
        result.sources.forEach((source, i) => {
            console.log(`   ${i + 1}. ${source.source} ${source.section ? `(Section ${source.section})` : ''}`);
            console.log(`      Score: ${source.score.toFixed(4)}`);
            console.log(`      Preview: ${source.text.substring(0, 100)}...\n`);
        });

        console.log('🎉 RAG is working correctly!');

    } catch (error) {
        console.error('❌ RAG Query Failed:', error.message);
    }
}

testRAGConnection().catch(console.error);
