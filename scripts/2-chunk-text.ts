import fs from 'fs';
import path from 'path';

interface Chunk {
    id: string;
    text: string;
    metadata: {
        source: string;
        docType: string;
        docNumber: string;
        chapter?: string;
        section?: string;
    };
}

function chunkDocument(text: string, metadata: any): Chunk[] {
    const chunks: Chunk[] = [];

    // Estrategia: Dividir por secciones y luego por tamaño
    // Los documentos OACI usan numeración como "4.2.3 TÍTULO"
    const sections = text.split(/(?=\n\s*\d+\.\d+)/);

    sections.forEach((section, sectionIndex) => {
        // Dividir secciones largas en sub-chunks de ~500 palabras
        const words = section.split(/\s+/);
        const chunkSize = 500;
        const overlap = 50; // Palabras de solapamiento para mantener contexto

        for (let i = 0; i < words.length; i += chunkSize - overlap) {
            const chunkWords = words.slice(i, Math.min(i + chunkSize, words.length));
            const chunkText = chunkWords.join(' ').trim();

            // Ignorar chunks muy pequeños (menos de 100 caracteres)
            if (chunkText.length < 100) continue;

            // Intentar extraer número de sección del texto
            const sectionMatch = chunkText.match(/^(\d+\.\d+(?:\.\d+)?)\s+([A-Z][^\n]+)/);

            chunks.push({
                id: `${metadata.filename}-${sectionIndex}-${i}`,
                text: chunkText,
                metadata: {
                    source: metadata.filename,
                    docType: metadata.type,
                    docNumber: metadata.number,
                    section: sectionMatch ? sectionMatch[1] : undefined,
                    chapter: sectionMatch ? sectionMatch[1].split('.')[0] : undefined,
                }
            });
        }
    });

    return chunks;
}

async function processAllDocuments() {
    const processedDir = path.join(process.cwd(), 'data', 'processed');
    const chunksDir = path.join(process.cwd(), 'data', 'chunks');

    if (!fs.existsSync(chunksDir)) {
        fs.mkdirSync(chunksDir, { recursive: true });
    }

    const files = fs.readdirSync(processedDir).filter(f => f.endsWith('.json'));

    if (files.length === 0) {
        console.log('⚠️  No se encontraron documentos procesados en data/processed/');
        console.log('📝 Primero ejecuta: npx tsx scripts/1-extract-pdf.ts');
        return;
    }

    console.log(`📝 Procesando ${files.length} documentos...\n`);

    let totalChunks = 0;

    for (const file of files) {
        const filePath = path.join(processedDir, file);
        const doc = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        console.log(`🔄 Chunking: ${doc.metadata.filename}`);
        const chunks = chunkDocument(doc.text, doc.metadata);

        // Guardar chunks
        const outputPath = path.join(chunksDir, file);
        fs.writeFileSync(outputPath, JSON.stringify(chunks, null, 2));

        console.log(`   ✅ Generados ${chunks.length} chunks`);
        console.log(`   💾 Guardado en: ${path.basename(outputPath)}\n`);
        totalChunks += chunks.length;
    }

    console.log(`✨ Total: ${totalChunks} chunks generados!\n`);
    console.log('📁 Chunks guardados en: data/chunks/');
}

processAllDocuments().catch(console.error);
