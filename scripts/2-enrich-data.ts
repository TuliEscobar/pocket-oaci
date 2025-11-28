import fs from 'fs';
import path from 'path';

const PROCESSED_DIR = path.join(process.cwd(), 'data', 'processed');

// Dictionary of Aerodromes: Name -> { iata, icao }
const AERODROMES: { [key: string]: { iata: string, icao: string, name: string } } = {
    'RESISTENCIA': { iata: 'SIS', icao: 'SARE', name: 'RESISTENCIA' },
    'SIS': { iata: 'SIS', icao: 'SARE', name: 'RESISTENCIA' },
    'SARE': { iata: 'SIS', icao: 'SARE', name: 'RESISTENCIA' },

    'AEROPARQUE': { iata: 'AER', icao: 'SABE', name: 'AEROPARQUE JORGE NEWBERY' },
    'AER': { iata: 'AER', icao: 'SABE', name: 'AEROPARQUE JORGE NEWBERY' },
    'SABE': { iata: 'AER', icao: 'SABE', name: 'AEROPARQUE JORGE NEWBERY' },

    'EZEIZA': { iata: 'EZE', icao: 'SAEZ', name: 'EZEIZA MINISTRO PISTARINI' },
    'EZE': { iata: 'EZE', icao: 'SAEZ', name: 'EZEIZA MINISTRO PISTARINI' },
    'SAEZ': { iata: 'EZE', icao: 'SAEZ', name: 'EZEIZA MINISTRO PISTARINI' },

    'CORDOBA': { iata: 'CBA', icao: 'SACO', name: 'CORDOBA' },
    'CBA': { iata: 'CBA', icao: 'SACO', name: 'CORDOBA' },
    'SACO': { iata: 'CBA', icao: 'SACO', name: 'CORDOBA' },

    'MENDOZA': { iata: 'DOZ', icao: 'SAME', name: 'MENDOZA' },
    'DOZ': { iata: 'DOZ', icao: 'SAME', name: 'MENDOZA' },
    'SAME': { iata: 'DOZ', icao: 'SAME', name: 'MENDOZA' },

    'SALTA': { iata: 'SLA', icao: 'SASA', name: 'SALTA' },
    'SLA': { iata: 'SLA', icao: 'SASA', name: 'SALTA' },
    'SASA': { iata: 'SLA', icao: 'SASA', name: 'SALTA' },

    'TUCUMAN': { iata: 'TUC', icao: 'SANT', name: 'TUCUMAN' },
    'TUC': { iata: 'TUC', icao: 'SANT', name: 'TUCUMAN' },
    'SANT': { iata: 'TUC', icao: 'SANT', name: 'TUCUMAN' },

    'MAR DEL PLATA': { iata: 'MDP', icao: 'SAZM', name: 'MAR DEL PLATA' },
    'MDP': { iata: 'MDP', icao: 'SAZM', name: 'MAR DEL PLATA' },
    'SAZM': { iata: 'MDP', icao: 'SAZM', name: 'MAR DEL PLATA' },

    'BARILOCHE': { iata: 'BAR', icao: 'SAZS', name: 'BARILOCHE' },
    'BAR': { iata: 'BAR', icao: 'SAZS', name: 'BARILOCHE' },
    'SAZS': { iata: 'BAR', icao: 'SAZS', name: 'BARILOCHE' },

    'COMODORO RIVADAVIA': { iata: 'CRV', icao: 'SAVC', name: 'COMODORO RIVADAVIA' },
    'CRV': { iata: 'CRV', icao: 'SAVC', name: 'COMODORO RIVADAVIA' },
    'SAVC': { iata: 'CRV', icao: 'SAVC', name: 'COMODORO RIVADAVIA' },

    'RIO GALLEGOS': { iata: 'GAL', icao: 'SAWG', name: 'RIO GALLEGOS' },
    'GAL': { iata: 'GAL', icao: 'SAWG', name: 'RIO GALLEGOS' },
    'SAWG': { iata: 'GAL', icao: 'SAWG', name: 'RIO GALLEGOS' },

    'USHUAIA': { iata: 'USU', icao: 'SAWH', name: 'USHUAIA' },
    'USU': { iata: 'USU', icao: 'SAWH', name: 'USHUAIA' },
    'SAWH': { iata: 'USU', icao: 'SAWH', name: 'USHUAIA' },

    'IGUAZU': { iata: 'IGU', icao: 'SARI', name: 'IGUAZU' },
    'IGU': { iata: 'IGU', icao: 'SARI', name: 'IGUAZU' },
    'SARI': { iata: 'IGU', icao: 'SARI', name: 'IGUAZU' },

    'POSADAS': { iata: 'POS', icao: 'SARP', name: 'POSADAS' },
    'POS': { iata: 'POS', icao: 'SARP', name: 'POSADAS' },
    'SARP': { iata: 'POS', icao: 'SARP', name: 'POSADAS' },

    'NEUQUEN': { iata: 'NEU', icao: 'SAZN', name: 'NEUQUEN' },
    'NEU': { iata: 'NEU', icao: 'SAZN', name: 'NEUQUEN' },
    'SAZN': { iata: 'NEU', icao: 'SAZN', name: 'NEUQUEN' },

    'BAHIA BLANCA': { iata: 'BCA', icao: 'SAZB', name: 'BAHIA BLANCA' },
    'BCA': { iata: 'BCA', icao: 'SAZB', name: 'BAHIA BLANCA' },
    'SAZB': { iata: 'BCA', icao: 'SAZB', name: 'BAHIA BLANCA' },

    'ROSARIO': { iata: 'ROS', icao: 'SAAR', name: 'ROSARIO' },
    'ROS': { iata: 'ROS', icao: 'SAAR', name: 'ROSARIO' },
    'SAAR': { iata: 'ROS', icao: 'SAAR', name: 'ROSARIO' },

    'PARANA': { iata: 'PAR', icao: 'SAAP', name: 'PARANA' },
    'PAR': { iata: 'PAR', icao: 'SAAP', name: 'PARANA' },
    'SAAP': { iata: 'PAR', icao: 'SAAP', name: 'PARANA' },

    'JUJUY': { iata: 'JUJ', icao: 'SASJ', name: 'JUJUY' },
    'JUJ': { iata: 'JUJ', icao: 'SASJ', name: 'JUJUY' },
    'SASJ': { iata: 'JUJ', icao: 'SASJ', name: 'JUJUY' },

    'FORMOSA': { iata: 'FMA', icao: 'SARF', name: 'FORMOSA' },
    'FMA': { iata: 'FMA', icao: 'SARF', name: 'FORMOSA' },
    'SARF': { iata: 'FMA', icao: 'SARF', name: 'FORMOSA' },

    'CATAMARCA': { iata: 'CAT', icao: 'SANC', name: 'CATAMARCA' },
    'CAT': { iata: 'CAT', icao: 'SANC', name: 'CATAMARCA' },
    'SANC': { iata: 'CAT', icao: 'SANC', name: 'CATAMARCA' },

    'LA RIOJA': { iata: 'LAR', icao: 'SANL', name: 'LA RIOJA' },
    'LAR': { iata: 'LAR', icao: 'SANL', name: 'LA RIOJA' },
    'SANL': { iata: 'LAR', icao: 'SANL', name: 'LA RIOJA' },

    'SAN JUAN': { iata: 'JUA', icao: 'SANU', name: 'SAN JUAN' },
    'JUA': { iata: 'JUA', icao: 'SANU', name: 'SAN JUAN' },
    'SANU': { iata: 'JUA', icao: 'SANU', name: 'SAN JUAN' },

    'SAN LUIS': { iata: 'OUI', icao: 'SAOU', name: 'SAN LUIS' },
    'OUI': { iata: 'OUI', icao: 'SAOU', name: 'SAN LUIS' },
    'SAOU': { iata: 'OUI', icao: 'SAOU', name: 'SAN LUIS' },

    'SANTA ROSA': { iata: 'OSA', icao: 'SAZR', name: 'SANTA ROSA' },
    'OSA': { iata: 'OSA', icao: 'SAZR', name: 'SANTA ROSA' },
    'SAZR': { iata: 'OSA', icao: 'SAZR', name: 'SANTA ROSA' },

    'VIEDMA': { iata: 'VDM', icao: 'SAVV', name: 'VIEDMA' },
    'VDM': { iata: 'VDM', icao: 'SAVV', name: 'VIEDMA' },
    'SAVV': { iata: 'VDM', icao: 'SAVV', name: 'VIEDMA' },

    'TRELEW': { iata: 'TRE', icao: 'SAVT', name: 'TRELEW' },
    'TRE': { iata: 'TRE', icao: 'SAVT', name: 'TRELEW' },
    'SAVT': { iata: 'TRE', icao: 'SAVT', name: 'TRELEW' },

    'ESQUEL': { iata: 'ESQ', icao: 'SAVE', name: 'ESQUEL' },
    'ESQ': { iata: 'ESQ', icao: 'SAVE', name: 'ESQUEL' },
    'SAVE': { iata: 'ESQ', icao: 'SAVE', name: 'ESQUEL' },

    'EL CALAFATE': { iata: 'ECA', icao: 'SAWC', name: 'EL CALAFATE' },
    'ECA': { iata: 'ECA', icao: 'SAWC', name: 'EL CALAFATE' },
    'SAWC': { iata: 'ECA', icao: 'SAWC', name: 'EL CALAFATE' },

    'RIO GRANDE': { iata: 'GRA', icao: 'SAWE', name: 'RIO GRANDE' },
    'GRA': { iata: 'GRA', icao: 'SAWE', name: 'RIO GRANDE' },
    'SAWE': { iata: 'GRA', icao: 'SAWE', name: 'RIO GRANDE' },

    'CORRIENTES': { iata: 'CNQ', icao: 'SARC', name: 'CORRIENTES' },
    'CNQ': { iata: 'CNQ', icao: 'SARC', name: 'CORRIENTES' },
    'SARC': { iata: 'CNQ', icao: 'SARC', name: 'CORRIENTES' },
};

// Helper to format the replacement
function formatAerodrome(info: { iata: string, icao: string, name: string }): string {
    return `${info.name}/${info.iata}/${info.icao}`;
}

function cleanText(text: string): string {
    let cleaned = text;
    // Remove common headers/footers
    cleaned = cleaned.replace(/AIP ARGENTINA\s+ENR\s+[\d\.-]+/g, '');
    cleaned = cleaned.replace(/DEPARTAMENTO INFORMACIÓN AERONÁUTICA.*/g, '');
    cleaned = cleaned.replace(/AIRAC AMDT.*/g, '');
    cleaned = cleaned.replace(/Página\s+\d+\s+de\s+\d+/gi, '');
    cleaned = cleaned.replace(/^\s*\d+\s*$/gm, ''); // Isolated page numbers

    // Collapse multiple newlines
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    return cleaned.trim();
}

function enrichText(text: string): string {
    let enriched = text;

    // We want to replace occurrences of keys in AERODROMES with the formatted string.
    // To avoid double replacement (e.g. replacing SIS inside RESISTENCIA/SIS/SARE),
    // we should be careful.
    // Strategy: 
    // 1. Identify all unique tokens that match our keys.
    // 2. Replace them if they are not already part of a formatted string.

    // Sort keys by length descending to match longest first (e.g. RESISTENCIA before SIS)
    const keys = Object.keys(AERODROMES).sort((a, b) => b.length - a.length);

    for (const key of keys) {
        const info = AERODROMES[key];
        const replacement = formatAerodrome(info);

        // Skip if the replacement is the same as the key (unlikely given the format)
        if (key === replacement) continue;

        // Regex to match the key as a whole word, but NOT if it's already part of the target format
        // e.g. match "SIS" but not "RESISTENCIA/SIS/SARE"
        // This is tricky with regex lookarounds.
        // Simplified approach: 
        // We will match the key surrounded by word boundaries.
        // We will check if the match is already surrounded by the other parts.

        const regex = new RegExp(`\\b${key}\\b`, 'g');
        enriched = enriched.replace(regex, (match, offset, string) => {
            // Check context
            const before = string.substring(Math.max(0, offset - 20), offset);
            const after = string.substring(offset + match.length, Math.min(string.length, offset + match.length + 20));

            if (before.includes(info.name) || before.includes(info.icao) || before.includes(info.iata)) return match;
            if (after.includes(info.name) || after.includes(info.icao) || after.includes(info.iata)) return match;

            return replacement;
        });
    }

    return enriched;
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
                neighbors?: string[];
            }[];
        }[];
    };
}

interface ExtractedContent {
    text: string;
    metadata: any;
    images?: ImageDescription[];
}

async function enrichData() {
    if (!fs.existsSync(PROCESSED_DIR)) {
        console.error('❌ Data directory not found.');
        return;
    }

    const files = fs.readdirSync(PROCESSED_DIR).filter(f => f.endsWith('.json'));
    console.log(`🔍 Enriching ${files.length} files...`);

    for (const file of files) {
        const filePath = path.join(PROCESSED_DIR, file);
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const doc = JSON.parse(content) as ExtractedContent;

            if (!doc || typeof doc !== 'object') {
                console.error(`⚠️ Invalid JSON content in ${file}`);
                continue;
            }

            // 1. Clean Text
            const originalText = doc.text || '';
            let newText = cleanText(originalText);

            // 2. Enrich Text
            newText = enrichText(newText);

            // 3. Update Doc
            doc.text = newText;

            // 4. Enrich Structured Data (Routes)
            if (doc.images) {
                for (const img of doc.images) {
                    if (img.structuredData && img.structuredData.routes) {
                        for (const route of img.structuredData.routes) {
                            // Enrich Waypoints
                            if (route.waypoints) {
                                for (const wp of route.waypoints) {
                                    // Check if waypoint name matches an aerodrome
                                    const upperName = wp.name.toUpperCase();
                                    if (AERODROMES[upperName]) {
                                        wp.name = formatAerodrome(AERODROMES[upperName]);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Save back
            fs.writeFileSync(filePath, JSON.stringify(doc, null, 2));
            console.log(`✅ Enriched ${file}`);

        } catch (e: any) {
            console.error(`❌ Error processing ${file}:`, e.message);
        }
    }
    console.log('✨ Enrichment complete!');
}

enrichData();
