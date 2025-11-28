import fs from 'fs';
import path from 'path';

const PROCESSED_DIR = path.join(process.cwd(), 'data', 'processed');

// Definimos los puntos de interés para la ruta Resistencia -> Aeroparque
const ORIGIN = { name: 'RESISTENCIA', aliases: ['SIS', 'SARE', 'RESISTENCIA'] };
const DESTINATION = { name: 'AEROPARQUE', aliases: ['AER', 'SABE', 'NEWBERY', 'AEROPARQUE'] };

// Puntos intermedios probables (Waypoints/VORs en la zona)
const INTEREST_POINTS = ['GAVEX', 'PABON', 'ROS', 'ROSARIO', 'ASGAS', 'RECONQUISTA', 'PUGLI', 'OPKAN', 'PAPIX', 'GBE', 'GENERAL BELGRANO'];

async function verifyRoute() {
    console.log(`🔍 Buscando ruta: ${ORIGIN.name} -> ${DESTINATION.name}`);
    console.log('---------------------------------------------------');

    if (!fs.existsSync(PROCESSED_DIR)) {
        console.error('❌ Data directory not found.');
        return;
    }

    const files = fs.readdirSync(PROCESSED_DIR).filter(f => f.endsWith('.json'));
    let relevantDocs = 0;

    for (const file of files) {
        const filePath = path.join(PROCESSED_DIR, file);
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const doc = JSON.parse(content);

            // 1. Buscar en Rutas Estructuradas (Extraídas de Imágenes)
            if (doc.images) {
                for (const img of doc.images) {
                    if (img.structuredData && img.structuredData.routes) {
                        for (const route of img.structuredData.routes) {
                            // Verificar si la ruta contiene puntos relevantes
                            const points = route.waypoints.map((wp: any) => wp.name.toUpperCase());

                            const hasOrigin = ORIGIN.aliases.some(alias => points.includes(alias));
                            const hasDest = DESTINATION.aliases.some(alias => points.includes(alias));
                            const hasIntermediates = INTEREST_POINTS.filter(ip => points.includes(ip));

                            if (hasOrigin || hasDest || hasIntermediates.length > 0) {
                                console.log(`📄 Documento: ${file}`);
                                console.log(`   ✈️  Aerovía encontrada: ${route.name}`);
                                console.log(`   📍 Secuencia: ${points.join(' -> ')}`);

                                if (hasOrigin) console.log('      ✅ Contiene ORIGEN');
                                if (hasDest) console.log('      ✅ Contiene DESTINO');
                                if (hasIntermediates.length > 0) console.log(`      🔹 Puntos intermedios: ${hasIntermediates.join(', ')}`);

                                console.log('---------------------------------------------------');
                                relevantDocs++;
                            }
                        }
                    }
                }
            }

        } catch (e: any) {
            console.error(`Error reading ${file}:`, e.message);
        }
    }

    if (relevantDocs === 0) {
        console.log('ℹ️  No se encontraron rutas directas o segmentos relevantes en los documentos procesados.');
    } else {
        console.log(`✨ Se encontraron ${relevantDocs} segmentos de ruta relevantes.`);
    }
}

verifyRoute();
