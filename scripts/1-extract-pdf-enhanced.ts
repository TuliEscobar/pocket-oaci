import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
// Require CommonJS modules
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialise Gemini AI (ensure GOOGLE_API_KEY env var is set)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

interface DocumentMetadata {
    filename: string;
    title: string;
    type: 'annex' | 'doc' | 'manual' | 'chart' | 'aip';
    number: string;
    extractedAt: string;
    hasImages: boolean;
    imageCount: number;
}

interface ImageDescription {
    pageNumber: number;
    description: string;
    structuredData?: {
        routes?: {
            name: string;
            waypoints: {
                name: string;
                type?: string;
                coordinates?: string;
                neighbors?: string[]; // Previous and next points
            }[];
        }[];
        airways?: string[]; // Keep for backward compatibility or flat list
        waypoints?: string[]; // Keep for backward compatibility
        frequencies?: string[];
        airspaces?: string[];
        restrictions?: string[];
    };
}

interface ExtractedContent {
    text: string;
    metadata: DocumentMetadata;
    images?: ImageDescription[];
}

/** Detect if a PDF is likely an aeronautical chart */
function isAeronauticalChart(filename: string, text: string): boolean {
    const fn = filename.toLowerCase();
    // Explicitly exclude ENR 3 (Route Tables) from being treated as visual charts
    if (fn.includes('enr 3') || fn.includes('enr-3') || fn.includes('enr3')) return false;

    const chartKeywords = ['carta', 'chart', 'enr 6', 'enr-6', 'map', 'vis', 'sup', 'inf'];
    const nameMatch = chartKeywords.some(k => fn.includes(k));

    // Heuristic: many single-character lines indicate spatial layout
    // But be careful not to trigger on tables with single letter columns
    const spacedLines = (text.match(/\n[A-Z]\n/g) || []).length;
    const ratio = spacedLines / Math.max(text.length, 1);

    return nameMatch || ratio > 0.005; // Increased threshold slightly
}

/** Placeholder image extraction – real rendering would need additional libs */
async function extractImagesFromPDF(pdfPath: string): Promise<{ pageNumber: number; imageData: string }[]> {
    try {
        const buffer = fs.readFileSync(pdfPath);
        const pdfDoc = await PDFDocument.load(buffer);
        const pages = pdfDoc.getPages();
        const images: { pageNumber: number; imageData: string }[] = [];
        // For demonstration we just note the page numbers; imageData left empty
        for (let i = 0; i < Math.min(pages.length, 5); i++) {
            console.log(`   📄 Page ${i + 1} marked for image extraction (placeholder)`);
            images.push({ pageNumber: i + 1, imageData: '' });
        }
        return images;
    } catch (e: any) {
        console.error('   ⚠️ Error extracting images:', e.message);
        return [];
    }
}

/** Analyse a chart image with Gemini Vision (placeholder – uses empty base64) */
async function analyzeChartWithVision(imageBase64: string, pageNumber: number): Promise<ImageDescription> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        // Enhanced prompt specifically focused on airways and waypoint sequences
        const prompt = `Eres un experto en cartas aeronáuticas. Tu ÚNICA PRIORIDAD es extraer AEROVÍAS (airways) y sus SECUENCIAS EXACTAS de puntos.

🎯 OBJETIVO PRINCIPAL: Identificar cada aerovía visible y su secuencia completa de waypoints.

📋 INSTRUCCIONES ESPECÍFICAS:

1. IDENTIFICAR AEROVÍAS:
   - Busca códigos de aerovías: W## (Victor), A### (RNAV), Z### (Jet), N### (North), etc.
   - Ejemplos: W20, W24, A307, Z118, N525

2. EXTRAER SECUENCIA DE PUNTOS (MUY IMPORTANTE):
   - Para CADA aerovía, identifica TODOS los puntos en ORDEN SECUENCIAL
   - Incluye: Waypoints (5 letras), VORs, NDBs, aeródromos
   - FORMATO OBLIGATORIO: Usa " -> " (espacio-flecha-espacio) entre puntos
   - Ejemplo: "RESISTENCIA -> SIS -> OPKAN -> ITADO -> RECONQUISTA -> ASGAS"

3. DETALLES DE CADA PUNTO (si visible):
   - Nombre del punto (ej: SIS, OPKAN, ITADO)
   - Tipo: VOR, NDB, Waypoint, DME, Aeródromo
   - Coordenadas (formato: 27°27'S 058°59'W)
   - Frecuencia (si aplica)

4. INFORMACIÓN ADICIONAL:
   - Frecuencias de radio (ACC, TWR, etc.)
   - FIRs y límites de espacio aéreo
   - Restricciones (SAR, SAP, etc.)

📝 FORMATO DE SALIDA REQUERIDO:

Ruta: W20
Secuencia: RESISTENCIA -> SIS -> OPKAN -> ITADO -> RECONQUISTA -> ASGAS -> ROSARIO
Detalles:
- SIS: VOR, 27°27'S 058°59'W, 113.5 MHz
- OPKAN: Waypoint, 27°45'S 059°15'W
- ITADO: Waypoint, 28°12'S 059°30'W

Ruta: A307
Secuencia: EZEIZA -> PAMAK -> SORTI -> LITOR
Detalles:
- PAMAK: Waypoint, 34°50'S 058°32'W
- SORTI: Waypoint, 33°15'S 059°45'W

⚠️ IMPORTANTE:
- Prioriza CALIDAD sobre cantidad
- Si no estás seguro de la secuencia, indica "SECUENCIA PARCIAL"
- Usa EXACTAMENTE el formato " -> " para separar puntos
- NO inventes puntos que no veas claramente

Analiza la carta y proporciona la información en el formato especificado.`;

        const result = await model.generateContent([
            { text: prompt },
            { inlineData: { mimeType: 'image/png', data: imageBase64 } },
        ]);
        const response = await result.response;
        const description = response.text();
        const structuredData = extractStructuredData(description);
        return { pageNumber, description, structuredData };
    } catch (e: any) {
        console.error('   ⚠️ Gemini Vision error:', e.message);
        return { pageNumber, description: 'Error analysing image' };
    }
}

/** Simple regex‑based extraction of structured data from Gemini description */
function extractStructuredData(text: string): ImageDescription['structuredData'] {
    const data: ImageDescription['structuredData'] = {
        routes: [],
        airways: [],
        waypoints: [],
        frequencies: [],
        airspaces: [],
        restrictions: []
    };

    // Parse Routes: "Ruta: W20" followed by "Secuencia: A -> B -> C"
    const routeBlocks = text.split(/Ruta:\s*/gi).slice(1); // Split by "Ruta:" (case insensitive)

    for (const block of routeBlocks) {
        const lines = block.split('\n').map(l => l.trim());
        const name = lines[0].trim();

        // Find sequence line (support multiple variations)
        const seqLine = lines.find(l =>
            l.includes('Secuencia:') ||
            l.includes('Sequence:') ||
            l.includes('Route:')
        );

        let waypoints: { name: string; type?: string; coordinates?: string; neighbors?: string[] }[] = [];

        if (seqLine) {
            // Extract sequence text
            const seqText = seqLine
                .replace(/Secuencia:/gi, '')
                .replace(/Sequence:/gi, '')
                .replace(/Route:/gi, '')
                .trim();

            // Split by various arrow formats: ->, –, →, >
            const points = seqText
                .split(/\s*(?:->|–|→|>)\s*/)
                .map(p => p.trim())
                .filter(p => p.length > 0);

            // Build waypoints with neighbors
            waypoints = points.map((p, i) => {
                const wp: any = {
                    name: p,
                    neighbors: []
                };

                // Add previous and next neighbors
                if (i > 0) wp.neighbors.push(points[i - 1]);
                if (i < points.length - 1) wp.neighbors.push(points[i + 1]);

                // Try to extract details from "Detalles:" section
                const detailsSection = block.substring(block.indexOf('Detalles:'));
                const pointDetailRegex = new RegExp(`-\\s*${p}[:\\s]+([^\\n]+)`, 'i');
                const detailMatch = detailsSection.match(pointDetailRegex);

                if (detailMatch) {
                    const details = detailMatch[1];
                    // Extract type (VOR, NDB, Waypoint, etc.)
                    const typeMatch = details.match(/\b(VOR|NDB|Waypoint|DME|Aeródromo|Aerodrome)\b/i);
                    if (typeMatch) wp.type = typeMatch[1];

                    // Extract coordinates
                    const coordMatch = details.match(/(\d{2}°\d{2}'[NS]\s+\d{3}°\d{2}'[EW])/);
                    if (coordMatch) wp.coordinates = coordMatch[1];
                }

                return wp;
            });
        }

        if (name && waypoints.length > 0) {
            data.routes?.push({ name, waypoints });
            // Also add to airways list
            if (!data.airways?.includes(name)) {
                data.airways?.push(name);
            }
        }
    }

    // Fallback/General extraction for airways not in structured format
    const airwayMatches = text.match(/\b[AWZNBGR]\d{1,3}\b/g);
    if (airwayMatches) {
        const uniqueAirways = [...new Set(airwayMatches)];
        uniqueAirways.forEach(aw => {
            if (!data.airways?.includes(aw)) {
                data.airways?.push(aw);
            }
        });
    }

    // Extract frequencies
    const freqMatches = text.match(/\b\d{3}\.\d{2,3}\b/g);
    if (freqMatches) data.frequencies = [...new Set(freqMatches)];

    // Extract airspaces
    const airspaceMatches = text.match(/\b(FIR|TMA|CTR|CTA)\s+[A-Z]+\b/g);
    if (airspaceMatches) data.airspaces = [...new Set(airspaceMatches)];

    // Extract restrictions
    const restrictionMatches = text.match(/\bSA[RPD]\s*\d+\b/g);
    if (restrictionMatches) data.restrictions = [...new Set(restrictionMatches)];

    // Extract all waypoints (5-letter codes)
    const wpMatches = text.match(/\b[A-Z]{5}\b/g);
    if (wpMatches) {
        const uniqueWps = [...new Set(wpMatches)];
        // Only add waypoints not already in routes
        const routeWaypoints = new Set(
            data.routes?.flatMap(r => r.waypoints.map(w => w.name)) || []
        );
        uniqueWps.forEach(wp => {
            if (!routeWaypoints.has(wp) && !data.waypoints?.includes(wp)) {
                data.waypoints?.push(wp);
            }
        });
    }

    return data;
}

/** Clean extracted PDF text – special handling for charts */
function cleanExtractedText(text: string, isChart: boolean): string {
    if (!isChart) {
        return text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    }
    const lines = text.split('\n').filter(l => l.trim().length > 10);
    const preview = lines.slice(0, 50).join('\n');
    return `[CARTA AERONÁUTICA - Contenido principalmente visual]\n\n${preview}`;
}

/** Fallback textual description for a chart based on raw text */
function generateChartDescription(text: string): string {
    const airways = [...new Set(text.match(/[AWZNBGR]\d{1,3}/g) || [])];
    const frequencies = [...new Set(text.match(/\d{3}\.\d{2,3}/g) || [])];
    const firs = [...new Set(text.match(/FIR\s+[A-Z]+/g) || [])];
    const tmas = [...new Set(text.match(/TMA\s+[A-Z]+/g) || [])];
    let desc = '**Carta de Navegación – Información Extraída:**\n\n';
    if (firs.length) desc += `**FIRs:** ${firs.join(', ')}\n\n`;
    if (tmas.length) desc += `**TMAs:** ${tmas.join(', ')}\n\n`;
    if (airways.length) desc += `**Aerovías:** ${airways.slice(0, 20).join(', ')}${airways.length > 20 ? '...' : ''}\n\n`;
    if (frequencies.length) desc += `**Frecuencias:** ${frequencies.slice(0, 15).join(', ')}${frequencies.length > 15 ? '...' : ''}\n\n`;
    return desc;
}

/** Extract structured data directly from raw PDF text (fallback) */
function extractStructuredDataFromText(text: string): ImageDescription['structuredData'] {
    // Basic heuristic to group waypoints near airways in text
    // This is very rough as raw text loses spatial layout
    const routes: { name: string; waypoints: any[] }[] = [];
    const airways = [...new Set(text.match(/[AWZNBGR]\d{1,3}/g) || [])];
    const waypoints = [...new Set(text.match(/[A-Z]{5}/g) || [])]; // Simplified WP regex

    // Mock grouping for fallback
    if (airways.length > 0) {
        routes.push({
            name: "Rutas Identificadas (Aproximado)",
            waypoints: waypoints.slice(0, 10).map(wp => ({ name: wp, neighbors: [] }))
        });
    }

    return {
        routes,
        airways,
        waypoints: waypoints.slice(0, 50),
        frequencies: [...new Set(text.match(/\d{3}\.\d{2,3}/g) || [])],
        airspaces: [...new Set(text.match(/(FIR|TMA|CTR|CTA)\s+[A-Z]+/g) || [])],
        restrictions: [...new Set(text.match(/SA[RPD]\s+\d+/g) || [])],
    };
}

function extractDocNumber(filename: string): string {
    const m = filename.match(/(\d+)/);
    return m ? m[1] : 'unknown';
}

/** Main PDF processing function */
async function processAllPDFs() {
    const rawDir = path.join(process.cwd(), 'data', 'raw');
    const processedDir = path.join(process.cwd(), 'data', 'processed');
    if (!fs.existsSync(processedDir)) fs.mkdirSync(processedDir, { recursive: true });

    const files = fs.readdirSync(rawDir).filter(f => f.toLowerCase().endsWith('.pdf'));
    if (files.length === 0) {
        console.log('⚠️ No PDFs found in data/raw/');
        console.log('📝 Place your OACI PDFs in that folder and retry.');
        return;
    }

    console.log(`📄 Found ${files.length} PDFs to process...\n`);
    let chartsProcessed = 0;
    let docsProcessed = 0;

    for (const file of files) {
        console.log(`🔄 Processing: ${file}`);
        const pdfPath = path.join(rawDir, file);
        try {
            const dataBuffer = fs.readFileSync(pdfPath);
            const data = await pdfParse(dataBuffer);
            const filename = path.basename(pdfPath);
            const isChart = isAeronauticalChart(filename, data.text);

            const metadata: DocumentMetadata = {
                filename,
                title: data.info?.Title || filename,
                type: isChart ? 'chart' : (filename.toLowerCase().includes('anexo') ? 'annex' : 'doc'),
                number: extractDocNumber(filename),
                extractedAt: new Date().toISOString(),
                hasImages: isChart,
                imageCount: 0,
            };

            let images: ImageDescription[] | undefined;
            if (isChart) {
                console.log('   🗺️ Detected aeronautical chart – placeholder image analysis');
                images = [{
                    pageNumber: 1,
                    description: generateChartDescription(data.text),
                    structuredData: extractStructuredDataFromText(data.text),
                }];
                metadata.imageCount = images.length;
                chartsProcessed++;
            } else {
                docsProcessed++;
            }

            const cleanedText = cleanExtractedText(data.text, isChart);

            const output = {
                metadata,
                text: cleanedText,
                images,
                pageCount: cleanedText.split('\n\n').length,
                characterCount: cleanedText.length,
            };

            const outPath = path.join(processedDir, `${path.parse(file).name}.json`);
            fs.writeFileSync(outPath, JSON.stringify(output, null, 2));

            console.log(`   ✅ Extracted ${cleanedText.length.toLocaleString()} characters`);
            console.log(`   📊 Type: ${metadata.type.toUpperCase()}`);
            if (images && images.length) {
                console.log(`   🖼️ Images analysed: ${images.length}`);
                const sd = images[0].structuredData;
                if (sd) console.log(`   ✈️ Airways: ${sd.airways?.length || 0}, Frequencies: ${sd.frequencies?.length || 0}`);
            }
            console.log(`   💾 Saved to ${path.basename(outPath)}\n`);
        } catch (e: any) {
            console.error(`   ❌ Error processing ${file}:`, e.message);
        }
    }

    console.log('✨ Extraction complete!\n');
    console.log('📊 Summary:');
    console.log(`   - Cartas aeronáuticas: ${chartsProcessed}`);
    console.log(`   - Documentos de texto: ${docsProcessed}`);
    console.log(`   - Total: ${chartsProcessed + docsProcessed}`);
    console.log('\n📁 Processed files are in data/processed/');
}

processAllPDFs().catch(console.error);
