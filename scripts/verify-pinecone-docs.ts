
import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY || '',
});

const indexName = 'oaci-docs';

const documentsToCheck = [
    "PR GOPE 069 Procedimiento para la recepción, control, aceptación y transmisión del FPL.pdf",
    "PROGEN ARO.pdf",
    "PROGEN ATM Enmienda 2 2021 if-2020-90835114-apn-dninaanac_210929_083205.pdf"
];

async function verifyDocuments() {
    if (!process.env.PINECONE_API_KEY) {
        console.error('❌ Error: PINECONE_API_KEY no encontrada en .env.local');
        return;
    }

    console.log(`🔍 Verificando documentos en el índice '${indexName}'...\n`);

    try {
        const index = pinecone.index(indexName);

        // Vector de ceros para la consulta (dimensión 768 para text-embedding-004)
        const zeroVector = new Array(768).fill(0);

        for (const docName of documentsToCheck) {
            process.stdout.write(`   Verificando: ${docName} ... `);

            // Consultar por metadato 'source'
            const queryResponse = await index.query({
                vector: zeroVector,
                topK: 1,
                filter: {
                    source: { $eq: docName }
                },
                includeMetadata: true
            });

            if (queryResponse.matches && queryResponse.matches.length > 0) {
                console.log('✅ ENCONTRADO');
            } else {
                console.log('❌ NO ENCONTRADO');
            }
        }

        console.log('\n✨ Verificación completada.');

    } catch (error: any) {
        console.error('\n❌ Error durante la verificación:', error.message);
    }
}

verifyDocuments().catch(console.error);
