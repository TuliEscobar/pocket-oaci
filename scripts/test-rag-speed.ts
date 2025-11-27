import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testSpeed() {
    const question = "Requisitos para piloto privado en Argentina";
    console.log(`\n🚀 Starting RAG Speed Test...`);
    console.log(`❓ Question: "${question}"`);
    console.log(`----------------------------------------`);

    try {
        // Import dynamically to ensure env vars are loaded first
        const { queryRAG } = await import('../lib/rag/rag-service');

        const startTime = Date.now();

        // The queryRAG function already has internal console.time logs we added
        const result = await queryRAG(question, 'es', 'ARG');

        const setupTime = Date.now() - startTime;
        console.log(`⏱️  Setup Time (Embedding + Pinecone): ${setupTime}ms`);

        let firstTokenTime = 0;
        let fullText = "";

        if (result.stream) {
            process.stdout.write("🤖 Streaming response: ");
            for await (const chunk of result.stream.stream) {
                const text = chunk.text();
                if (!firstTokenTime) {
                    firstTokenTime = Date.now() - startTime;
                    console.log(`\n⚡ Time to First Token: ${firstTokenTime}ms`);
                }
                process.stdout.write("."); // Dot for each chunk
                fullText += text;
            }
            console.log("\n");
        } else {
            fullText = result.answer || "";
        }

        const totalTime = Date.now() - startTime;

        console.log(`----------------------------------------`);
        console.log(`✅ Test Complete`);
        console.log(`⏱️  Total Time: ${totalTime}ms`);
        console.log(`📝 Answer Length: ${fullText.length} chars`);
        console.log(`📚 Sources Found: ${result.sources.length}`);

    } catch (error) {
        console.error("❌ Test Failed:", error);
    }
}

testSpeed();
