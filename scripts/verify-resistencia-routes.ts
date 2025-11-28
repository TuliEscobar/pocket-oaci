import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || '' });
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

async function searchRoutes() {
    let output = '';
    output += '🔍 Buscando información sobre rutas desde Resistencia...\n\n';

    // Generar embedding para la consulta
    const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const query = "ruta óptima de Resistencia a Córdoba vuelo IFR";
    const questionEmbedding = await embeddingModel.embedContent(query);

    // Buscar en Pinecone
    const index = pinecone.index('oaci-docs');
    const searchResults = await index.query({
        vector: questionEmbedding.embedding.values,
        topK: 10,
        includeMetadata: true
    });

    output += `📊 Encontrados ${searchResults.matches.length} resultados:\n\n`;

    searchResults.matches.forEach((match, i) => {
        output += `${i + 1}. **${match.metadata?.source}** (Score: ${(match.score! * 100).toFixed(1)}%)\n`;
        output += `   Sección: ${match.metadata?.section || 'N/A'}\n`;
        output += `   Preview: ${(match.metadata?.text as string || '').substring(0, 300)}...\n`;
        output += '\n';
    });

    // Buscar específicamente por "Resistencia" o "SIS"
    output += '\n🔍 Buscando menciones específicas de "Resistencia" o "SIS"...\n\n';
    const resistenciaQuery = await embeddingModel.embedContent("Resistencia SIS SARE aerovía ruta W20");
    const resistenciaResults = await index.query({
        vector: resistenciaQuery.embedding.values,
        topK: 15,
        includeMetadata: true
    });

    let found = 0;
    resistenciaResults.matches.forEach((match, i) => {
        const text = (match.metadata?.text as string || '').toLowerCase();
        if (text.includes('resistencia') || text.includes('sis') || text.includes('sare')) {
            found++;
            output += `✅ ${found}. **${match.metadata?.source}** (Score: ${(match.score! * 100).toFixed(1)}%)\n`;
            output += `   Contenido: ${(match.metadata?.text as string || '').substring(0, 500)}...\n`;
            output += '\n';
        }
    });

    if (found === 0) {
        output += '⚠️ No se encontraron menciones directas de Resistencia/SIS/SARE en los top 15 resultados.\n';
    }

    // Guardar en archivo
    const outputPath = path.join(process.cwd(), 'resistencia-routes-analysis.txt');
    fs.writeFileSync(outputPath, output);

    console.log(output);
    console.log(`\n📄 Resultados guardados en: ${outputPath}`);
}

searchRoutes().catch(console.error);
