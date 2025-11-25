const fs = require('fs');
const path = require('path');

const leadsFile = path.join(__dirname, '..', 'data', 'leads.json');

if (!fs.existsSync(leadsFile)) {
    console.log('⚠️  No hay leads todavía. El archivo leads.json no existe.');
    process.exit(0);
}

const leads = JSON.parse(fs.readFileSync(leadsFile, 'utf-8'));

if (leads.length === 0) {
    console.log('⚠️  No hay leads para exportar.');
    process.exit(0);
}

// Convertir a CSV
const csv = [
    'Email,Rol,Documento,Desafío,Fecha,ID',
    ...leads.map(l =>
        `${l.email},${l.role},${l.document || 'N/A'},"${(l.painPoint || '').replace(/"/g, '""')}",${l.date},${l.id}`
    )
].join('\n');

const outputFile = path.join(__dirname, '..', 'leads.csv');
fs.writeFileSync(outputFile, csv);

console.log(`✅ Exportados ${leads.length} leads a leads.csv`);
console.log(`📊 Estadísticas:`);

// Contar por rol
const roleCount = {};
leads.forEach(l => {
    roleCount[l.role] = (roleCount[l.role] || 0) + 1;
});

console.log('\n👥 Distribución por Rol:');
Object.entries(roleCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([role, count]) => {
        console.log(`   ${role}: ${count}`);
    });

// Documentos más mencionados
const docCount = {};
leads.forEach(l => {
    if (l.document) {
        const doc = l.document.toUpperCase();
        docCount[doc] = (docCount[doc] || 0) + 1;
    }
});

if (Object.keys(docCount).length > 0) {
    console.log('\n📚 Documentos Más Solicitados:');
    Object.entries(docCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .forEach(([doc, count]) => {
            console.log(`   ${doc}: ${count}`);
        });
}
