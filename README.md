# ✈️ OACI.ai - Pocket OACI

**Your AI-powered aviation regulations assistant**

OACI.ai is an intelligent chatbot that provides instant, accurate answers about international and Argentine aviation regulations. Powered by Google Gemini 2.0 Flash and a comprehensive RAG (Retrieval-Augmented Generation) system with 7,709+ document chunks.

🌐 **Live Demo**: [oaci.ai](https://oaci.ai)

---

## 🛠️ Tech Stack

### Core Technologies
- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **AI Model**: [Google Gemini 2.0 Flash Experimental](https://ai.google.dev/)
- **Embeddings**: Google text-embedding-004 (768 dimensions)
- **Vector Database**: [Pinecone](https://www.pinecone.io/) Serverless
- **Authentication**: [Clerk](https://clerk.com/) with Google Sign-In
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Markdown**: [react-markdown](https://github.com/remarkjs/react-markdown)
- **i18n**: [next-intl](https://next-intl-docs.vercel.app/)
- **Mobile**: [Capacitor](https://capacitorjs.com/) for Android app

### Performance Optimizations
- **Streaming Responses**: Real-time text generation with NDJSON
- **Smart Caching**: Reduced context retrieval (topK: 8)
- **Fast Model**: Gemini 2.0 Flash for sub-second first token
- **Response Time**: ~6 seconds to first token, ~11 seconds total

---

## 🗄️ Database Status

- **Pinecone Index**: `oaci-docs`
- **Total Vectors**: 7,709
- **Documents Loaded**:
  - ✅ **ICAO Doc 4444**: Air Traffic Management (PANS-ATM)
  - ✅ **ICAO Annex 15**: Aeronautical Information Services (Ed. 2018)
  - ✅ **AIP Argentina GEN**: General (Regulations, Tables, Services)
  - ✅ **AIP Argentina ENR**: En-Route (Rules, Airspace, ATS Routes, Navaids, Procedures)
  - ✅ **RAAC Part 61**: Pilot licenses, ratings and certificates
  - ✅ **RAAC Part 65**: Airman other than flight crew members
  - ✅ **RAAC Part 91**: General operating and flight rules
  - ✅ **RAAC Part 135**: Operating requirements: non-scheduled domestic and international operations
  - ✅ **PR GOPE 069**: Procedure for reception, control and transmission of FPL
  - ✅ **PROGEN ARO**: General ARO Procedures
  - ✅ **PROGEN ATM**: General Air Traffic Management Procedures (Amendment 2 2021)
- **Embedding Model**: text-embedding-004 (768 dimensions)
- **Cost**: $0/month (within free tiers)

---

## 🔄 RAG Pipeline

The system uses a complete RAG (Retrieval-Augmented Generation) pipeline with streaming support:

### Architecture Flow
```
User Query → Embedding Generation (1-2s)
          ↓
    Pinecone Search (1-2s)
          ↓
    Context Retrieval (8 chunks)
          ↓
    Gemini 2.0 Flash Stream (~1s to first token)
          ↓
    Real-time Response Display
```

### Pipeline Steps

1. **PDF Extraction** → Extract text from official PDFs
2. **Chunking** → Split documents into semantic chunks (~500 words)
3. **Embedding** → Generate vectors using Google's text-embedding-004
4. **Vector Storage** → Store in Pinecone for fast similarity search
5. **Retrieval** → Find top 8 most relevant chunks for each query
6. **Streaming Generation** → Gemini 2.0 Flash generates contextual answers with real-time streaming

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

# 6. Verify Embeddings (Optional)
npx tsx scripts/verify-pinecone-docs.ts

# 7. Test RAG Speed (Optional)
npx tsx scripts/test-rag-speed.ts
```

---

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
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

4. **Deploy**
   
   Click "Deploy" and wait 2-3 minutes

### Build for Production

```bash
npm run build
npm start
```

---

## 🌍 Features

### Current Features (v0.7 - Streaming Update)

- ✅ **Streaming Responses**: Real-time text generation (6s to first token)
- ✅ **Optimized Performance**: 60% faster than previous version
- ✅ **Smart Source Grouping**: No duplicate documents, shows reference count
- ✅ **Premium UI**: Gradient cards with hover effects and animations
- ✅ **Android App**: Native mobile app using Capacitor (hybrid architecture)
- ✅ **Authentication**: Clerk integration with Google Sign-In
- ✅ **Waitlist System**: User registration form with Google Sheets integration
- ✅ **Voice Input**: Ask questions using your microphone (Web Speech API)
- ✅ **Branding**: "OACI de Bolsillo" / "Pocket OACI" identity
- ✅ **Jurisdiction Selector**: Switch between ICAO (English) and Argentina (Spanish)
- ✅ **Markdown Responses**: Beautiful formatting with bold, lists, and structure
- ✅ **Source Citations**: Exact document references with relevance scores
- ✅ **Responsive Design**: Works on desktop and mobile
- ✅ **Dark Mode**: Eye-friendly interface
- ✅ **RAG-Powered**: Answers from 7,709 document chunks
- ✅ **Performance Logging**: Detailed timing metrics for debugging

### Recent Updates (November 2024)

**Performance Improvements:**
- Implemented streaming responses using NDJSON format
- Switched to Gemini 2.0 Flash Experimental for faster generation
- Reduced context retrieval from 12 to 8 chunks
- Added comprehensive performance logging
- Response time improved from ~29s to ~11s (60% faster)
- Time to first token: ~6s (user sees response immediately)

**UI/UX Enhancements:**
- Redesigned source citations with smart grouping
- Added reference and section counters
- Implemented gradient progress bars
- Added hover effects and animations
- Removed duplicate document names
- Premium card design with glow effects

### Coming Soon

- 🔄 Android app on Play Store
- 🔄 Conversation history
- 🔄 More ICAO Annexes (1, 2, 6, 14)
- 🔄 Export to PDF
- 🔄 More jurisdictions (FAA, EASA)

---

## 📖 Documentation

### Main Documentation
- **[RAG_IMPLEMENTATION.md](./RAG_IMPLEMENTATION.md)**: Complete RAG architecture guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)**: Deployment guide for Vercel
- **[VISIONARY_ROADMAP.md](./VISIONARY_ROADMAP.md)**: Long-term product strategy

### 📱 Android App
- **[docs/android/](./docs/android/)**: Complete Android app documentation
  - [Quick Start Guide](./docs/android/QUICKSTART.md)
  - [Build Guide](./docs/android/BUILD_GUIDE.md)
  - [Clerk Setup](./docs/android/CLERK_SETUP.md)
  - [Setup Summary](./docs/android/SETUP_SUMMARY.md)

### 🎨 Social Media
- **[social/](./social/)**: Social media strategy and content
  - [LinkedIn Guide](./social/LINKEDIN_GUIA_COMPLETA.md)
  - [Social Media Strategy](./docs/SOCIAL_MEDIA_STRATEGY.md)

---

## ⚡ Performance Metrics

### Response Time Breakdown
```
Embedding Generation:    1-2s
Pinecone Query:          1-2s
LLM Initialization:      <1s
Time to First Token:     ~6s  ← User sees response
Total Time:              ~11s
```

### Before vs After Optimization
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Total Time | 29s | 11s | **60% faster** |
| Time to First Token | 29s | 6s | **79% faster** |
| Model | Gemini 2.5 Pro | Gemini 2.0 Flash | Faster |
| Context Chunks | 12 | 8 | Optimized |
| User Experience | Loading screen | Real-time streaming | ✨ |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- ICAO for providing official aviation regulations
- ANAC Argentina for RAAC documentation
- Google AI for Gemini API
- Pinecone for vector database
- Clerk for authentication services
- Vercel for hosting

---

**Built with ❤️ for the skies**

For questions or feedback, please open an issue on GitHub or visit [oaci.ai](https://oaci.ai)
