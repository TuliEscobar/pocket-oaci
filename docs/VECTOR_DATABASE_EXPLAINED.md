# 🧠 Base de Datos Vectorial en OACI.ai - Explicación Técnica

## 📋 Índice
1. [¿Qué es una Base de Datos Vectorial?](#qué-es-una-base-de-datos-vectorial)
2. [Arquitectura del Sistema RAG](#arquitectura-del-sistema-rag)
3. [Pipeline de Procesamiento de Documentos](#pipeline-de-procesamiento-de-documentos)
4. [Cómo Funciona una Query](#cómo-funciona-una-query)
5. [Embeddings: La Magia Detrás de Todo](#embeddings-la-magia-detrás-de-todo)
6. [Pinecone: Nuestra Base de Datos Vectorial](#pinecone-nuestra-base-de-datos-vectorial)
7. [Búsqueda Semántica vs Búsqueda por Palabras Clave](#búsqueda-semántica-vs-búsqueda-por-palabras-clave)
8. [Optimizaciones y Configuración](#optimizaciones-y-configuración)

---

## 🤔 ¿Qué es una Base de Datos Vectorial?

Una **base de datos vectorial** es un tipo especial de base de datos diseñada para almacenar y buscar **vectores** (arrays de números) de manera eficiente.

### Analogía Simple
Imagina que cada documento es un punto en un espacio multidimensional. Los documentos con significados similares están **cerca** unos de otros en este espacio.

```
Documento A: "Requisitos para ser piloto"        → Vector: [0.2, 0.8, 0.1, ...]
Documento B: "Licencia de piloto comercial"     → Vector: [0.3, 0.7, 0.2, ...]
Documento C: "Mantenimiento de aeronaves"       → Vector: [0.9, 0.1, 0.8, ...]
```

Los documentos A y B están **cerca** en el espacio vectorial (hablan de pilotos).
El documento C está **lejos** (habla de mantenimiento).

---

## 🏗️ Arquitectura del Sistema RAG

**RAG** = **Retrieval-Augmented Generation** (Generación Aumentada por Recuperación)

### Componentes Principales

```
┌─────────────────────────────────────────────────────────────┐
│                    OACI.ai RAG System                        │
└─────────────────────────────────────────────────────────────┘

1. DOCUMENTOS PDF (ICAO, RAAC)
   ↓
2. EXTRACCIÓN DE TEXTO (pdf-parse)
   ↓
3. CHUNKING (División en fragmentos)
   ↓
4. EMBEDDINGS (Google text-embedding-004)
   ↓
5. PINECONE (Base de datos vectorial)
   ↓
6. BÚSQUEDA SEMÁNTICA (Similarity Search)
   ↓
7. GEMINI 2.5 PRO (Generación de respuesta)
```

---

## 📦 Pipeline de Procesamiento de Documentos

### Paso 1: Extracción de Texto
**Script:** `scripts/1-extract-pdf.ts`

```typescript
// Extraemos el texto de los PDFs
const pdfData = await pdfParse(dataBuffer);
const text = pdfData.text;

// Guardamos en JSON
fs.writeFileSync('data/extracted/icao-doc-8168.json', JSON.stringify({
  source: 'icao-doc-8168',
  text: text,
  metadata: { docType: 'ICAO', docNumber: '8168' }
}));
```

**Resultado:** Archivos JSON con el texto completo de cada documento.

---

### Paso 2: Chunking (División en Fragmentos)
**Script:** `scripts/2-chunk-text.ts`

**¿Por qué dividir?**
- Los documentos ICAO son enormes (cientos de páginas)
- Los modelos de IA tienen límites de contexto
- Queremos encontrar **fragmentos específicos** relevantes a la pregunta

```typescript
// Dividimos el texto en chunks de ~1000 caracteres
const chunkSize = 1000;
const overlap = 200; // Solapamiento para no perder contexto

const chunks = [];
for (let i = 0; i < text.length; i += chunkSize - overlap) {
  chunks.push({
    id: `${source}-chunk-${chunkIndex}`,
    text: text.substring(i, i + chunkSize),
    metadata: {
      source: 'icao-doc-8168',
      docType: 'ICAO',
      section: 'Chapter 4'
    }
  });
}
```

**Resultado:** Miles de fragmentos pequeños, cada uno con su ID único.

---

### Paso 3: Generación de Embeddings
**Script:** `scripts/3-generate-embeddings.ts`

**¿Qué es un embedding?**
Un embedding es una **representación numérica** del significado de un texto.

```typescript
// Usamos el modelo de Google para generar embeddings
const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
const result = await model.embedContent(chunk.text);

// Resultado: Array de 768 números
const embedding = result.embedding.values;
// [0.023, -0.145, 0.678, ..., 0.234] (768 dimensiones)
```

**Características del modelo `text-embedding-004`:**
- **Dimensión:** 768 números por vector
- **Capacidad:** Captura el significado semántico del texto
- **Multilingüe:** Funciona en español e inglés

**Ejemplo Visual:**
```
Texto: "El piloto debe tener 1500 horas de vuelo"
↓
Embedding: [0.12, -0.34, 0.56, 0.78, ..., -0.23]
           └─────────────────────────────────┘
                    768 números
```

---

### Paso 4: Upload a Pinecone
**Script:** `scripts/4-upload-to-pinecone.ts`

```typescript
// Creamos el índice en Pinecone
await pinecone.createIndex({
  name: 'oaci-docs',
  dimension: 768,        // Dimensión de text-embedding-004
  metric: 'cosine',      // Medida de similitud
  spec: {
    serverless: {
      cloud: 'aws',
      region: 'us-east-1'
    }
  }
});

// Subimos los vectores en batches de 100
const vectors = chunks.map(chunk => ({
  id: chunk.id,
  values: chunk.embedding,  // El vector de 768 dimensiones
  metadata: {
    text: chunk.text,
    source: chunk.metadata.source,
    section: chunk.metadata.section
  }
}));

await index.upsert(vectors);
```

**Resultado:** Base de datos vectorial con miles de vectores indexados y listos para búsqueda.

---

## 🔍 Cómo Funciona una Query

### Flujo Completo de una Pregunta del Usuario

```
Usuario pregunta: "¿Qué necesito para ser piloto comercial?"
                           ↓
┌──────────────────────────────────────────────────────────────┐
│ 1. GENERACIÓN DE EMBEDDING DE LA PREGUNTA                    │
└──────────────────────────────────────────────────────────────┘
```

**Código:** `lib/rag/rag-service.ts` (líneas 23-25)

```typescript
// Convertimos la pregunta en un vector
const embeddingModel = genAI.getGenerativeModel({ 
  model: 'text-embedding-004' 
});
const questionEmbedding = await embeddingModel.embedContent(question);

// Resultado: Vector de 768 dimensiones
const queryVector = questionEmbedding.embedding.values;
// [0.45, -0.12, 0.89, ..., 0.34]
```

---

```
                           ↓
┌──────────────────────────────────────────────────────────────┐
│ 2. BÚSQUEDA EN PINECONE (Similarity Search)                  │
└──────────────────────────────────────────────────────────────┘
```

**Código:** `lib/rag/rag-service.ts` (líneas 28-33)

```typescript
const index = pinecone.index('oaci-docs');
const searchResults = await index.query({
  vector: questionEmbedding.embedding.values,  // Vector de la pregunta
  topK: 12,                                     // Top 12 resultados más similares
  includeMetadata: true                         // Incluir texto y metadata
});
```

**¿Qué hace Pinecone internamente?**

1. **Calcula la similitud coseno** entre el vector de la pregunta y TODOS los vectores en la base de datos
2. **Ordena** los resultados por similitud (score de 0 a 1)
3. **Retorna** los top 12 fragmentos más relevantes

**Similitud Coseno:**
```
score = cos(θ) = (A · B) / (||A|| × ||B||)

Donde:
- A = Vector de la pregunta
- B = Vector del documento
- θ = Ángulo entre los vectores

Score cercano a 1 = Muy similar
Score cercano a 0 = No relacionado
```

**Ejemplo de Resultados:**
```javascript
[
  {
    id: "raac-part-61-chunk-45",
    score: 0.89,  // 89% de similitud
    metadata: {
      text: "Para obtener la licencia de piloto comercial...",
      source: "raac-part-61",
      section: "61.123"
    }
  },
  {
    id: "icao-annex-1-chunk-120",
    score: 0.85,  // 85% de similitud
    metadata: {
      text: "Los requisitos mínimos para pilotos comerciales...",
      source: "icao-annex-1",
      section: "2.1.10"
    }
  },
  // ... 10 resultados más
]
```

---

```
                           ↓
┌──────────────────────────────────────────────────────────────┐
│ 3. CONSTRUCCIÓN DEL CONTEXTO                                 │
└──────────────────────────────────────────────────────────────┘
```

**Código:** `lib/rag/rag-service.ts` (líneas 36-46)

```typescript
// Extraemos los fragmentos relevantes
const sources: RAGSource[] = searchResults.matches.map(match => ({
  text: match.metadata?.text as string,
  source: match.metadata?.source as string,
  section: match.metadata?.section as string,
  score: match.score || 0
}));

// Construimos el contexto para Gemini
const context = sources
  .map((s, i) => `[Fragmento ${i + 1} - ${s.source}, Sección ${s.section}]
${s.text}`)
  .join('\n\n---\n\n');
```

**Resultado:**
```
[Fragmento 1 - raac-part-61, Sección 61.123]
Para obtener la licencia de piloto comercial, el solicitante debe:
1. Tener al menos 18 años de edad
2. Poseer certificado médico de Clase 1
3. Completar 250 horas de vuelo...

---

[Fragmento 2 - icao-annex-1, Sección 2.1.10]
Los requisitos mínimos para pilotos comerciales incluyen...

---

[Fragmento 3 - raac-part-61, Sección 61.125]
Experiencia de vuelo requerida: El solicitante debe haber completado...
```

---

```
                           ↓
┌──────────────────────────────────────────────────────────────┐
│ 4. GENERACIÓN DE RESPUESTA CON GEMINI                        │
└──────────────────────────────────────────────────────────────┘
```

**Código:** `lib/rag/rag-service.ts` (líneas 49-162)

```typescript
// Prompt del sistema con el contexto
const systemPrompt = `Eres OACI.ai, un asistente experto en aviación.

CONTEXTO DE DOCUMENTOS:
${context}

INSTRUCCIONES:
1. Responde basándote SOLO en el contexto proporcionado
2. Cita las fuentes exactas
3. Sé claro y completo
...`;

// Enviamos al modelo Gemini
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-pro-preview-03-25' 
});

const chat = model.startChat({
  history: [
    { role: 'user', parts: [{ text: systemPrompt }] },
    { role: 'model', parts: [{ text: 'Entendido.' }] }
  ]
});

const result = await chat.sendMessage(question);
const answer = result.response.text();
```

**Respuesta Final:**
```markdown
**Para ser piloto comercial en Argentina, necesitás cumplir con los siguientes requisitos:**

### Requisitos de Edad y Médicos
- Tener al menos **18 años de edad**
- Poseer **certificado médico de Clase 1** vigente

### Experiencia de Vuelo
- Completar un mínimo de **250 horas de vuelo**, que incluyan:
  - 100 horas como piloto al mando
  - 20 horas de vuelo por instrumentos
  - 10 horas de vuelo nocturno

### Formación Teórica
- Aprobar los exámenes teóricos de ANAC en:
  - Derecho aéreo
  - Conocimiento general de aeronaves
  - Performance y planificación de vuelo
  - Meteorología
  - Navegación
  - Procedimientos operacionales
  - Principios de vuelo
  - Comunicaciones

**Fuente:** RAAC Parte 61, Secciones 61.123 y 61.125
```

---

## 🧮 Embeddings: La Magia Detrás de Todo

### ¿Cómo Funcionan los Embeddings?

Los embeddings son **representaciones densas** del significado de un texto en un espacio vectorial de alta dimensión.

**Ejemplo Simplificado (2D en lugar de 768D):**

```
Espacio Vectorial 2D:

     ↑ Dimensión 2 (Formalidad)
     │
  1  │     "Anexo OACI"
     │          ●
     │
0.5  │  "Regulación"    "Licencia"
     │       ●              ●
     │
  0  │  "Piloto"  "Avión"
     │     ●         ●
     │
-0.5 │         "Volar"
     │            ●
     │
 -1  │
     └────────────────────────────→ Dimensión 1 (Aviación)
        -1    0    0.5    1
```

**En 768 dimensiones:**
- Cada dimensión captura un aspecto diferente del significado
- Palabras/frases similares tienen vectores cercanos
- La distancia entre vectores = similitud semántica

### Propiedades Matemáticas

**1. Similitud Semántica:**
```
"piloto comercial" ≈ "licencia de piloto"
(vectores cercanos)

"piloto comercial" ≠ "mantenimiento de motor"
(vectores lejanos)
```

**2. Operaciones Vectoriales:**
```
Vector("Rey") - Vector("Hombre") + Vector("Mujer") ≈ Vector("Reina")
Vector("ICAO") - Vector("Internacional") + Vector("Argentina") ≈ Vector("RAAC")
```

---

## 🗄️ Pinecone: Nuestra Base de Datos Vectorial

### ¿Por Qué Pinecone?

1. **Optimizado para Vectores:** Búsqueda ultra-rápida en millones de vectores
2. **Serverless:** No necesitamos gestionar infraestructura
3. **Escalable:** Crece automáticamente con nuestros datos
4. **Similitud Coseno:** Algoritmo optimizado para embeddings

### Configuración de Nuestro Índice

```typescript
{
  name: 'oaci-docs',
  dimension: 768,           // Dimensión de text-embedding-004
  metric: 'cosine',         // Medida de similitud
  spec: {
    serverless: {
      cloud: 'aws',
      region: 'us-east-1'   // Región cercana para baja latencia
    }
  }
}
```

### Estructura de un Vector en Pinecone

```javascript
{
  id: "raac-part-61-chunk-45",           // ID único
  values: [0.12, -0.34, ..., 0.56],      // Vector de 768 dimensiones
  metadata: {                             // Metadata asociada
    text: "Para obtener la licencia...", // Texto original (max 40KB)
    source: "raac-part-61",               // Documento fuente
    docType: "RAAC",                      // Tipo de documento
    docNumber: "61",                      // Número de parte
    section: "61.123",                    // Sección específica
    chapter: "Subpart F"                  // Capítulo
  }
}
```

### Operaciones en Pinecone

**1. Upsert (Insertar/Actualizar):**
```typescript
await index.upsert([
  { id: 'vec-1', values: [...], metadata: {...} },
  { id: 'vec-2', values: [...], metadata: {...} }
]);
```

**2. Query (Búsqueda):**
```typescript
const results = await index.query({
  vector: queryVector,      // Vector de la pregunta
  topK: 12,                 // Top 12 resultados
  includeMetadata: true     // Incluir metadata
});
```

**3. Fetch (Obtener por ID):**
```typescript
const vector = await index.fetch(['vec-1', 'vec-2']);
```

---

## 🔎 Búsqueda Semántica vs Búsqueda por Palabras Clave

### Búsqueda Tradicional (Palabras Clave)

```
Pregunta: "¿Qué necesito para ser piloto comercial?"

Búsqueda: "piloto" AND "comercial"
          ↓
Encuentra documentos que contengan exactamente esas palabras
```

**Problemas:**
- ❌ No entiende sinónimos ("aviador" vs "piloto")
- ❌ No entiende contexto ("banco" = institución financiera vs asiento)
- ❌ Requiere coincidencia exacta de palabras

---

### Búsqueda Semántica (Vectorial)

```
Pregunta: "¿Qué necesito para ser piloto comercial?"
          ↓
Embedding: [0.45, -0.12, 0.89, ..., 0.34]
          ↓
Busca vectores similares (significado similar)
          ↓
Encuentra:
- "Requisitos para licencia de piloto comercial" ✅
- "Cómo obtener la habilitación de piloto" ✅
- "Experiencia necesaria para aviadores comerciales" ✅
```

**Ventajas:**
- ✅ Entiende sinónimos y variaciones
- ✅ Captura el significado, no solo palabras
- ✅ Funciona en múltiples idiomas
- ✅ Encuentra resultados relevantes aunque no compartan palabras exactas

---

### Ejemplo Comparativo

**Pregunta:** "¿Cuántas horas de vuelo necesito?"

**Búsqueda por Palabras Clave:**
```
Busca: "horas" AND "vuelo"
Encuentra: 
- "El vuelo duró 3 horas" ❌ (no relevante)
- "Horario de vuelos" ❌ (no relevante)
```

**Búsqueda Semántica:**
```
Entiende: Usuario pregunta sobre requisitos de experiencia
Encuentra:
- "Experiencia mínima: 250 horas de vuelo" ✅
- "El solicitante debe acumular 1500 horas" ✅
- "Tiempo de vuelo requerido para la licencia" ✅
```

---

## ⚙️ Optimizaciones y Configuración

### 1. TopK (Número de Resultados)

**Configuración Actual:** `topK: 12`

```typescript
const searchResults = await index.query({
  vector: questionEmbedding.embedding.values,
  topK: 12,  // Recuperamos 12 fragmentos
  includeMetadata: true
});
```

**¿Por qué 12?**
- ✅ **Más contexto** = Respuestas más completas
- ✅ Cubre múltiples aspectos de una pregunta compleja
- ⚠️ Más tokens = Mayor costo de API
- ⚠️ Más contexto = Respuestas más lentas

**Trade-off:**
```
topK = 3  → Respuestas rápidas pero incompletas
topK = 12 → Respuestas completas y detalladas (actual)
topK = 20 → Muy completo pero lento y costoso
```

---

### 2. Chunk Size (Tamaño de Fragmentos)

**Configuración Actual:** `~1000 caracteres con overlap de 200`

```typescript
const chunkSize = 1000;
const overlap = 200;
```

**¿Por qué 1000 caracteres?**
- ✅ Suficiente contexto para entender el tema
- ✅ No demasiado grande para el límite de metadata de Pinecone
- ✅ Balance entre granularidad y contexto

**Overlap (Solapamiento):**
```
Chunk 1: [0────────1000]
              Chunk 2: [800────────1800]
                    Chunk 3: [1600────────2600]
                    ↑
              Overlap de 200 caracteres
```

**Beneficio:** No perdemos información en los límites de los chunks.

---

### 3. Modelo de Embedding

**Modelo Actual:** `text-embedding-004` (Google)

**Características:**
- **Dimensión:** 768
- **Multilingüe:** Español, Inglés, y más
- **Calidad:** Estado del arte en similitud semántica
- **Costo:** ~$0.00001 por 1000 caracteres

**Alternativas:**
- `text-embedding-3-small` (OpenAI) - 1536 dimensiones
- `text-embedding-3-large` (OpenAI) - 3072 dimensiones

---

### 4. Filtrado por Jurisdicción

**Código:** `lib/rag/rag-service.ts` (líneas 64-67)

```typescript
// Priorizamos documentos según la jurisdicción
if (jurisdiction === 'ARG') {
  // Damos prioridad a RAAC sobre ICAO
  systemPrompt += `
  - DA PRIORIDAD ABSOLUTA a las RAAC (Regulaciones Argentinas)
  - Si encuentras información relevante en RAAC, úsala primero
  - Solo menciona OACI si RAAC no cubre el tema
  `;
}
```

**Mejora Futura:** Filtrar en Pinecone con metadata
```typescript
const searchResults = await index.query({
  vector: queryVector,
  topK: 12,
  filter: {
    docType: { $eq: 'RAAC' }  // Solo documentos RAAC
  }
});
```

---

## 📊 Métricas y Estadísticas

### Nuestra Base de Datos Actual

```
📦 Índice: oaci-docs
├── Dimensión: 768
├── Métrica: cosine
├── Vectores totales: ~15,000+
├── Documentos fuente: 
│   ├── ICAO Annexes (1, 6, 8, etc.)
│   ├── ICAO Documents (8168, 9859, etc.)
│   └── RAAC Parts (61, 91, 135, etc.)
└── Tamaño total: ~50 MB de metadata
```

### Performance

```
Tiempo de Query:
├── Embedding de pregunta: ~200ms
├── Búsqueda en Pinecone: ~100ms
├── Generación con Gemini: ~3-5s
└── Total: ~3.5-5.5s
```

---

## 🎯 Resumen del Flujo Completo

```
┌─────────────────────────────────────────────────────────────┐
│ USUARIO: "¿Qué necesito para ser piloto comercial?"         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 1. EMBEDDING DE LA PREGUNTA                                  │
│    Pregunta → Vector[768]                                    │
│    [0.45, -0.12, 0.89, ..., 0.34]                           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. BÚSQUEDA EN PINECONE                                      │
│    - Calcula similitud coseno con 15,000+ vectores          │
│    - Retorna top 12 fragmentos más similares                │
│    - Scores: [0.89, 0.85, 0.82, ..., 0.71]                 │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. CONSTRUCCIÓN DEL CONTEXTO                                 │
│    [Fragmento 1 - raac-part-61]                             │
│    Para obtener la licencia de piloto comercial...          │
│    ---                                                       │
│    [Fragmento 2 - icao-annex-1]                             │
│    Los requisitos mínimos incluyen...                       │
│    ...                                                       │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. GENERACIÓN CON GEMINI 2.5 PRO                            │
│    Prompt: Sistema + Contexto + Pregunta                    │
│    → Respuesta completa con fuentes citadas                 │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ RESPUESTA AL USUARIO                                         │
│ "Para ser piloto comercial en Argentina, necesitás..."      │
│ **Fuente:** RAAC Parte 61, Sección 61.123                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Código de Referencia

### Query Completa en `rag-service.ts`

```typescript
export async function queryRAG(
  question: string, 
  locale: string = 'es', 
  jurisdiction: 'ICAO' | 'ARG' = 'ICAO'
): Promise<RAGResult> {
  
  // 1. Generar embedding de la pregunta
  const embeddingModel = genAI.getGenerativeModel({ 
    model: 'text-embedding-004' 
  });
  const questionEmbedding = await embeddingModel.embedContent(question);
  
  // 2. Buscar en Pinecone
  const index = pinecone.index('oaci-docs');
  const searchResults = await index.query({
    vector: questionEmbedding.embedding.values,
    topK: 12,
    includeMetadata: true
  });
  
  // 3. Extraer contexto
  const sources = searchResults.matches.map(match => ({
    text: match.metadata?.text as string,
    source: match.metadata?.source as string,
    section: match.metadata?.section as string,
    score: match.score || 0
  }));
  
  const context = sources
    .map((s, i) => `[Fragmento ${i + 1} - ${s.source}]\n${s.text}`)
    .join('\n\n---\n\n');
  
  // 4. Generar respuesta con Gemini
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-pro-preview-03-25' 
  });
  
  const chat = model.startChat({
    history: [
      { role: 'user', parts: [{ text: systemPrompt + context }] },
      { role: 'model', parts: [{ text: 'Entendido.' }] }
    ]
  });
  
  const result = await chat.sendMessage(question);
  
  // 5. Retornar respuesta con fuentes
  return {
    answer: result.response.text(),
    sources: sources,
    model: 'gemini-2.5-pro-preview-03-25 + RAG'
  };
}
```

---

## 📚 Recursos Adicionales

- **Pinecone Docs:** https://docs.pinecone.io/
- **Google Embeddings:** https://ai.google.dev/docs/embeddings
- **RAG Patterns:** https://www.pinecone.io/learn/retrieval-augmented-generation/
- **Vector Similarity:** https://www.pinecone.io/learn/vector-similarity/

---

## 🎓 Conclusión

El sistema de base de datos vectorial en OACI.ai permite:

✅ **Búsqueda semántica inteligente** - Entiende el significado, no solo palabras
✅ **Respuestas precisas y citadas** - Basadas en documentos oficiales
✅ **Escalabilidad** - Puede crecer a millones de documentos
✅ **Multilingüe** - Funciona en español e inglés
✅ **Rápido** - Búsqueda en milisegundos entre miles de vectores

**La magia está en los embeddings:** Convertir texto en vectores que capturan significado permite búsquedas mucho más inteligentes que las tradicionales.

---

**Creado para OACI.ai** 🛩️
*Última actualización: 2025-11-25*
