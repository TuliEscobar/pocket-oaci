import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

// Usar createRequire para módulos CommonJS
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

interface DocumentMetadata {
    filename: string;
    title: string;
    type: 'annex' | 'doc' | 'manual';
    number: string;
    extractedAt: string;
}

async function extractPDF(pdfPath: string): Promise<{ text: string, metadata: DocumentMetadata }> {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);

    // Extraer metadata del nombre del archivo
    const filename = path.basename(pdfPath);
    const metadata: DocumentMetadata = {
        filename,
        title: data.info?.Title || filename,
        type: filename.toLowerCase().includes('anexo') ? 'annex' : 'doc',
        number: extractDocNumber(filename),
        extractedAt: new Date().toISOString()
    };

    return {
        text: data.text,
        metadata
    };
}

function extractDocNumber(filename: string): string {
    const match = filename.match(/(\d+)/);
    return match ? match[1] : 'unknown';
}

async function processAllPDFs() {
    const rawDir = path.join(process.cwd(), 'data', 'raw');
    const processedDir = path.join(process.cwd(), 'data', 'processed');

    // Crear directorio si no existe
    if (!fs.existsSync(processedDir)) {
        fs.mkdirSync(processedDir, { recursive: true });
    }

    const files = fs.readdirSync(rawDir).filter(f => f.endsWith('.pdf'));

    if (files.length === 0) {
        console.log('⚠️  No se encontraron archivos PDF en data/raw/');
        console.log('📝 Por favor, coloca tus PDFs de la OACI en la carpeta data/raw/');
        return;
    }

    console.log(`📄 Encontrados ${files.length} PDFs para procesar...\n`);

    for (const file of files) {
        console.log(`🔄 Procesando: ${file}`);
        const pdfPath = path.join(rawDir, file);

        try {
            const { text, metadata } = await extractPDF(pdfPath);

            // Guardar texto extraído
            const outputPath = path.join(processedDir, `${path.parse(file).name}.json`);
            fs.writeFileSync(outputPath, JSON.stringify({
                metadata,
                text,
                pageCount: text.split('\n\n').length,
                characterCount: text.length
            }, null, 2));

            console.log(`   ✅ Extraído: ${text.length.toLocaleString()} caracteres`);
            console.log(`   📊 Tipo: ${metadata.type.toUpperCase()} ${metadata.number}`);
            console.log(`   💾 Guardado en: ${path.basename(outputPath)}\n`);
        } catch (error: any) {
            console.error(`   ❌ Error procesando ${file}:`, error.message);
            console.error(`   Stack:`, error.stack);
        }
    }

    console.log('✨ Extracción completada!\n');
    console.log('📁 Archivos procesados guardados en: data/processed/');
}

// Ejecutar
processAllPDFs().catch(console.error);
