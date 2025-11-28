import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config({ path: '.env.local' });

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Tipos para la data estructurada
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
                neighbors?: string[];
            }[];
        }[];
        airways?: string[];
        waypoints?: string[];
        frequencies?: string[];
        airspaces?: string[];
        restrictions?: string[];
    };
}

interface ExtractedContent {
    text: string;
    metadata: {
        filename: string;
        title: string;
        type: 'chart';
        number: string;
        extractedAt: string;
        hasImages: boolean;
        imageCount: number;
    };
    images: ImageDescription[];
}

// Función auxiliar para extraer datos estructurados (reutilizada y adaptada)
function extractStructuredData(text: string): ImageDescription['structuredData'] {
    const data: ImageDescription['structuredData'] = {
        routes: [],
        airways: [],
        waypoints: [],
        frequencies: [],
        airspaces: [],
        restrictions: []
    };

    const routeBlocks = text.split(/Ruta:\s*/gi).slice(1);

    for (const block of routeBlocks) {
        const lines = block.split('\n').map(l => l.trim());
        const name = lines[0].trim();

        const seqLine = lines.find(l =>
            l.includes('Secuencia:') ||
            l.includes('Sequence:') ||
            l.includes('Route:')
        );

        let waypoints: any[] = [];

        if (seqLine) {
            const seqText = seqLine
                .replace(/Secuencia:/gi, '')
                .replace(/Sequence:/gi, '')
                .replace(/Route:/gi, '')
                .trim();

            const points = seqText
                .split(/\s*(?:->|–|→|>)\s*/)
                .map(p => p.trim())
                .filter(p => p.length > 0);

            waypoints = points.map((p, i) => {
                const wp: any = { name: p, neighbors: [] };
                if (i > 0) wp.neighbors.push(points[i - 1]);
                if (i < points.length - 1) wp.neighbors.push(points[i + 1]);

                // Intentar extraer detalles
                const detailsSection = block.substring(block.indexOf('Detalles:'));
                const pointDetailRegex = new RegExp(`-\\s*${p}[:\\s]+([^\\n]+)`, 'i');
                const detailMatch = detailsSection.match(pointDetailRegex);

                if (detailMatch) {
                    const details = detailMatch[1];
                    const typeMatch = details.match(/\b(VOR|NDB|Waypoint|DME|Aeródromo|Aerodrome)\b/i);
                    if (typeMatch) wp.type = typeMatch[1];
                    const coordMatch = details.match(/(\d{2}°\d{2}'[NS]\s+\d{3}°\d{2}'[EW])/);
                    if (coordMatch) wp.coordinates = coordMatch[1];
                }
                return wp;
            });
        }

        if (name && waypoints.length > 0) {
            data.routes?.push({ name, waypoints });
            if (!data.airways?.includes(name)) data.airways?.push(name);
        }
    }

    // Extracciones generales
    const airwayMatches = text.match(/\b[AWZNBGR]\d{1,3}\b/g);
    if (airwayMatches) {
        [...new Set(airwayMatches)].forEach(aw => {
            if (!data.airways?.includes(aw)) data.airways?.push(aw);
        });
    }

    const freqMatches = text.match(/\b\d{3}\.\d{2,3}\b/g);
    if (freqMatches) data.frequencies = [...new Set(freqMatches)];

    const airspaceMatches = text.match(/\b(FIR|TMA|CTR|CTA)\s+[A-Z]+\b/g);
    if (airspaceMatches) data.airspaces = [...new Set(airspaceMatches)];

    return data;
}

async function analyzeImage(imagePath: string): Promise<ImageDescription> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        const imageBuffer = fs.readFileSync(imagePath);
        const imageBase64 = imageBuffer.toString('base64');

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

⚠️ IMPORTANTE:
- Prioriza CALIDAD sobre cantidad
- Si no estás seguro de la secuencia, indica "SECUENCIA PARCIAL"
- Usa EXACTAMENTE el formato " -> " para separar puntos
- NO inventes puntos que no veas claramente`;

        const result = await model.generateContent([
            { text: prompt },
            { inlineData: { mimeType: 'image/png', data: imageBase64 } },
        ]);
        const response = await result.response;
        const description = response.text();
        const structuredData = extractStructuredData(description);

        return { pageNumber: 1, description, structuredData };

    } catch (e: any) {
        console.error('   ⚠️ Error analizando imagen:', e.message);
        return { pageNumber: 1, description: 'Error analysing image' };
    }
}

async function processImages() {
    const rawDir = path.join(process.cwd(), 'data', 'raw');
    const processedDir = path.join(process.cwd(), 'data', 'processed');

    if (!fs.existsSync(processedDir)) fs.mkdirSync(processedDir, { recursive: true });

    const files = fs.readdirSync(rawDir).filter(f =>
        f.toLowerCase().endsWith('.png') ||
        f.toLowerCase().endsWith('.jpg') ||
        f.toLowerCase().endsWith('.jpeg')
    );

    if (files.length === 0) {
        console.log('⚠️ No se encontraron imágenes en data/raw/');
        return;
    }

    console.log(`🖼️ Encontradas ${files.length} imágenes para procesar...\n`);

    for (const file of files) {
        console.log(`🔄 Procesando: ${file}`);
        const imagePath = path.join(rawDir, file);

        const analysis = await analyzeImage(imagePath);

        const output: ExtractedContent = {
            text: `[IMAGEN DE CARTA AERONÁUTICA: ${file}]\n\n${analysis.description}`,
            metadata: {
                filename: file,
                title: file,
                type: 'chart',
                number: '1',
                extractedAt: new Date().toISOString(),
                hasImages: true,
                imageCount: 1
            },
            images: [analysis]
        };

        const outPath = path.join(processedDir, `${path.parse(file).name}.json`);
        fs.writeFileSync(outPath, JSON.stringify(output, null, 2));

        console.log(`   ✅ Análisis completado`);
        if (analysis.structuredData?.routes?.length) {
            console.log(`   ✈️ Rutas extraídas: ${analysis.structuredData.routes.length}`);
            analysis.structuredData.routes.forEach(r => console.log(`      - ${r.name}: ${r.waypoints.length} puntos`));
        }
        console.log(`   💾 Guardado en ${path.basename(outPath)}\n`);
    }
}

processImages().catch(console.error);
