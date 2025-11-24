# 🚀 RAG Quick Start Guide

## ✅ Setup Completado

Ya tienes toda la infraestructura RAG configurada:

- ✅ Carpetas creadas (`data/`, `scripts/`, `lib/rag/`)
- ✅ Dependencias instaladas
- ✅ Scripts de procesamiento listos
- ✅ Servicio RAG integrado con el chat
- ✅ Tests preparados

## 📋 Próximos Pasos

### 1. Configurar Pinecone (5 minutos)

```bash
# 1. Ve a https://www.pinecone.io/
# 2. Crea una cuenta gratuita
# 3. Crea un nuevo proyecto
# 4. Obtén tu API key
```

Añade la API key a tu `.env.local`:

```env
GOOGLE_API_KEY=tu_key_existente
PINECONE_API_KEY=tu_pinecone_key_aqui
```

### 2. Obtener Documentos OACI

Coloca tus PDFs de la OACI en la carpeta `data/raw/`:

```
data/raw/
├── anexo-1.pdf
├── anexo-6.pdf
└── doc-4444.pdf
```

**Recomendación para empezar**: Consigue al menos el **Anexo 6** (Operación de Aeronaves).

### 3. Ejecutar Pipeline RAG

Una vez tengas los PDFs, ejecuta estos comandos en orden:

```bash
# Paso 1: Extraer texto de los PDFs
npx tsx scripts/1-extract-pdf.ts

# Paso 2: Dividir en chunks semánticos
npx tsx scripts/2-chunk-text.ts

# Paso 3: Generar embeddings (toma ~1 segundo por chunk)
npx tsx scripts/3-generate-embeddings.ts

# Paso 4: Subir a Pinecone
npx tsx scripts/4-upload-to-pinecone.ts
```

### 4. Probar el RAG

```bash
# Ejecutar tests
npx tsx scripts/test-rag.ts

# O iniciar el servidor y probar en el chat
npm run dev
```

## 🎯 Cómo Funciona

1. **Usuario hace pregunta** → Frontend envía a `/api/chat`
2. **API verifica RAG** → Si está configurado, usa RAG; si no, usa modo estándar
3. **RAG busca** → Genera embedding de la pregunta y busca en Pinecone
4. **Gemini responde** → Con contexto de documentos oficiales
5. **Usuario recibe** → Respuesta + fuentes citadas

## 📊 Estado Actual

- **Modo actual**: Estándar (sin RAG)
- **Para activar RAG**: Completa pasos 1-3 arriba
- **Fallback automático**: Si RAG falla, usa modo estándar

## 🔍 Verificar Estado

El sistema automáticamente detecta si RAG está configurado. Verás en los logs:

```
🔍 Using RAG with official ICAO documents...  ← RAG activo
⚠️  RAG not configured, using standard mode   ← RAG no configurado
```

## 💡 Tips

- **Empieza pequeño**: 1 documento para probar el pipeline
- **Rate limiting**: Script 3 espera 1 segundo entre embeddings (límite de API)
- **Costos**: Free tier de Pinecone soporta hasta 1M vectores (suficiente para ~20 anexos)
- **Actualizar docs**: Re-ejecuta el pipeline completo con nuevos PDFs

## 🆘 Troubleshooting

**Error: "PINECONE_API_KEY not configured"**
→ Añade la key a `.env.local`

**Error: "No se encontraron archivos PDF"**
→ Coloca PDFs en `data/raw/`

**RAG muy lento**
→ Normal en primera ejecución (generando embeddings). Después es rápido.

---

**¿Listo para empezar?** Consigue un PDF de la OACI y ejecuta el pipeline! 🚀
