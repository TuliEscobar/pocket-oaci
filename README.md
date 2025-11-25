```

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **AI Model**: [Google Gemini 2.5 Pro](https://ai.google.dev/)
- **Embeddings**: Google text-embedding-004 (768 dimensions)
- **Vector Database**: [Pinecone](https://www.pinecone.io/) Serverless
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Markdown**: [react-markdown](https://github.com/remarkjs/react-markdown)
- **i18n**: [next-intl](https://next-intl-docs.vercel.app/)

## 🗄️ Database Status

- **Pinecone Index**: `oaci-docs`
- **Total Vectors**: 2,960
- **Documents Loaded**:
  - ✅ **ICAO Anexo 15**: Servicios de Información Aeronáutica (Ed. 2018)
  - ✅ **RAAC Parte 61**: Licencias, certificados de competencia y habilitaciones para pilotos
  - ✅ **RAAC Parte 65**: Personal aeronáutico excepto miembros de la tripulación de vuelo
  - ✅ **RAAC Parte 91**: Reglas de vuelo y operación general
  - ✅ **RAAC Parte 135**: Requisitos de operación: operaciones no regulares internas e internacionales
  - ✅ **PR GOPE 069**: Procedimiento para recepción, control y transmisión del FPL
  - ✅ **PROGEN ARO**: Procedimientos Generales ARO
  - ✅ **PROGEN ATM**: Procedimientos Generales de Gestión de Tránsito Aéreo
- **Embedding Model**: text-embedding-004 (768 dimensions)
- **Cost**: $0/month (within free tiers)

## 🔄 RAG Pipeline

The system uses a complete RAG (Retrieval-Augmented Generation) pipeline:

1. **PDF Extraction** → Extract text from official PDFs
2. **Chunking** → Split documents into semantic chunks (~500 words)
3. **Embedding** → Generate vectors using Google's text-embedding-004
4. **Vector Storage** → Store in Pinecone for fast similarity search
5. **Retrieval** → Find top 8 most relevant chunks for each query
6. **Generation** → Gemini 2.5 Pro generates contextual answers with markdown

### Processing New Documents

```bash
# 1. Place PDFs in data/pdfs/
# 2. Extract text
npx tsx scripts/1-extract-pdf.ts

# 3. Chunk documents
npx tsx scripts/2-chunk-documents.ts

# 4. Generate embeddings
npx tsx scripts/3-generate-embeddings.ts

# 5. Upload to Pinecone
npx tsx scripts/4-upload-to-pinecone.ts
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**
   
   In Vercel dashboard, add:
   - `GOOGLE_API_KEY`
   - `PINECONE_API_KEY`

4. **Deploy**
   
   Click "Deploy" and wait 2-3 minutes

### Build for Production

```bash
npm run build
npm start
```

## 🌍 Features

### Current Features (v0.5)

- ✅ **Waitlist System**: User registration form with Google Sheets integration
- ✅ **Voice Input**: Ask questions using your microphone (Web Speech API)
- ✅ **Branding**: New "OACI de Bolsillo" / "Pocket OACI" identity
- ✅ **Jurisdiction Selector**: Switch between ICAO (English) and Argentina (Spanish)
- ✅ **Markdown Responses**: Beautiful formatting with bold, lists, and structure
- ✅ **Source Citations**: Exact document references with relevance scores
- ✅ **Responsive Design**: Works on desktop and mobile
- ✅ **Dark Mode**: Eye-friendly interface
- ✅ **RAG-Powered**: Answers from 2,960 document chunks

### Coming Soon

- 🔄 Conversation history
- 🔄 More ICAO Annexes (1, 2, 6, 14)
- 🔄 Export to PDF
- 🔄 More jurisdictions (FAA, EASA)

## 📖 Documentation

- **[RAG_IMPLEMENTATION.md](./RAG_IMPLEMENTATION.md)**: Complete RAG architecture guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)**: Deployment guide for Vercel
- **[VISIONARY_ROADMAP.md](./VISIONARY_ROADMAP.md)**: Long-term product strategy

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- ICAO for providing official aviation regulations
- ANAC Argentina for RAAC documentation
- Google AI for Gemini API
- Pinecone for vector database

---

**Built with ❤️ for the skies**

For questions or feedback, please open an issue on GitHub.
