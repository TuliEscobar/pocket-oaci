import { queryRAG } from '../lib/rag/rag-service';
import testCases from '../tests/rag-test-cases.json';

async function testRAG() {
    console.log('🧪 Iniciando tests del RAG...\n');
    console.log('='.repeat(80));

    let passedTests = 0;
    let failedTests = 0;

    for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        const locale = (testCase as any).language || 'es';

        console.log(`\n📝 Test ${i + 1}/${testCases.length}`);
        console.log(`❓ Pregunta: ${testCase.question}`);
        console.log(`📚 Fuente esperada: ${testCase.expectedSource}`);

        try {
            const startTime = Date.now();
            const result = await queryRAG(testCase.question, locale);
            const duration = Date.now() - startTime;

            console.log(`\n✅ Respuesta generada en ${duration}ms:`);
            console.log(`   ${result.answer.substring(0, 300)}${result.answer.length > 300 ? '...' : ''}`);

            console.log(`\n📊 Fuentes encontradas (${result.sources.length}):`);
            result.sources.forEach((source, idx) => {
                const relevanceEmoji = source.score > 0.8 ? '🟢' : source.score > 0.6 ? '🟡' : '🔴';
                console.log(`   ${relevanceEmoji} [${idx + 1}] ${source.source}${source.section ? ` - Sección ${source.section}` : ''}`);
                console.log(`      Relevancia: ${(source.score * 100).toFixed(1)}%`);
                console.log(`      Preview: ${source.text.substring(0, 100)}...`);
            });

            // Verificar si la fuente esperada está en los resultados
            const foundExpectedSource = result.sources.some(s =>
                s.source.toLowerCase().includes(testCase.expectedSource.toLowerCase())
            );

            if (foundExpectedSource) {
                console.log(`\n✅ PASS: Fuente esperada encontrada`);
                passedTests++;
            } else {
                console.log(`\n⚠️  WARNING: Fuente esperada no encontrada en los top 5 resultados`);
                failedTests++;
            }

        } catch (error: any) {
            console.log(`\n❌ ERROR: ${error.message}`);
            failedTests++;
        }

        console.log('\n' + '='.repeat(80));
    }

    console.log(`\n🎯 Resultados finales:`);
    console.log(`   ✅ Tests pasados: ${passedTests}/${testCases.length}`);
    console.log(`   ❌ Tests fallidos: ${failedTests}/${testCases.length}`);
    console.log(`   📊 Tasa de éxito: ${((passedTests / testCases.length) * 100).toFixed(1)}%`);
}

testRAG().catch(console.error);
