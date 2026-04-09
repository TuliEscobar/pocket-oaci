# ✈️ OACI.ai - Pocket OACI

**Your AI-powered aviation regulations assistant**

OACI.ai is an intelligent chatbot that provides instant, accurate answers about international and Argentine aviation regulations. Powered by Google Gemini 2.0 Flash and a comprehensive RAG (Retrieval-Augmented Generation) system with 7,709+ document chunks.

🌐 **Live Demo**: [oaci.ai](https://oaci.ai)

---

## 🛠️ Tech Stack

### Core Technologies
- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **AI Model**: [Google Gemini 2.0 Flash Experimental](https://ai.google.dev/) (Text & Vision)
- **Embeddings**: 
  - **Dense**: Google text-embedding-004 (768 dimensions)
  - **Sparse**: Custom TF-Hashing (Keyword Search)
- **Vector Database**: [Pinecone](https://www.pinecone.io/) Serverless (Hybrid Search)
- **Authentication**: [Clerk](https://clerk.com/) with Google Sign-In
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Markdown**: [react-markdown](https://github.com/remarkjs/react-markdown)
- **i18n**: [next-intl](https://next-intl-docs.vercel.app/)
- **Mobile**: [Capacitor](https://capacitorjs.com/) for Android app

### Performance Optimizations
- **Streaming Responses**: Real-time text generation with NDJSON
- **Hybrid Retrieval**: Combines semantic understanding with exact keyword matching
- **Smart Caching**: Reduced context retrieval (topK: 8)
- **Fast Model**: Gemini 2.0 Flash for sub-second first token
- **Response Time**: ~6 seconds to first token, ~11 seconds total

---

## 🗄️ Database Status

- **Pinecone Index**: `oaci-docs`
- **Total Vectors**: 7,740+
- **Documents Loaded**:
  - ✅ **Visual Charts (New)**: ENR 6.x (High/Low Altitude Routes) extracted via Gemini Vision
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
- **Embedding Model**: Hybrid (Dense + Sparse)
- **Cost**: $0/month (within free tiers)

---

## 🔄 Hybrid RAG Pipeline

The system uses an advanced **Hybrid RAG** pipeline that combines semantic search, keyword matching, and computer vision:

### Architecture Flow
```
User Query → Hybrid Embedding (Dense + Sparse)
          ↓
    Pinecone Hybrid Search (Dot Product)
          ↓
    Context Retrieval (Text Chunks + Visual Route Data)
          ↓
    Gemini 2.0 Flash Stream (~1s to first token)
          ↓
    Real-time Response Display
```

### Pipeline Steps

1.  **Multi-Modal Extraction**:
    *   **PDFs**: Enhanced text extraction for regulations.
    *   **Images**: Gemini Vision analyzes charts to extract structured route data (Waypoints, Airways).
2.  **Enrichment**: Normalize airport codes (e.g., "RESISTENCIA" → "RESISTENCIA/SIS/SARE").
3.  **Chunking**: Split documents into semantic chunks.
4.  **Hybrid Embedding**: 
    *   Generate dense vectors (semantics).
    *   Generate sparse vectors (keywords/codes like "W20", "SARE").
5.  **Vector Storage**: Store in Pinecone with `dotproduct` metric.
6.  **Retrieval**: Find most relevant chunks using hybrid scoring.
7.  **Streaming Generation**: Gemini 2.0 Flash generates contextual answers.

### Processing New Documents

```bash
# 1. Place files in data/raw/ (PDFs or Images .png/.jpg)

# 2. Extract Data (Choose based on file type)
npx ts-node scripts/1-extract-images.ts       # For Charts/Images
npx ts-node scripts/1-extract-pdf-enhanced.ts # For Text PDFs

# 3. Enrich Data (Normalize codes)
npx ts-node scripts/2-enrich-data.ts

# 4. Chunk Documents
npx ts-node scripts/3-chunk-text.ts

# 5. Generate Hybrid Embeddings
npx ts-node scripts/4-generate-embeddings.ts

# 6. Upload to Pinecone
npx ts-node scripts/5-upload-to-pinecone.ts

# 7. Verify Routes (Optional)
npx ts-node scripts/verify-route-res-aer.ts
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

### Recent Updates (December 2024)

**New Capabilities:**
- 🆓 **Free Query System**: Allows unauthenticated users to make one free query per day (tracked via localStorage).
- 🔐 **Supabase Integration**: Full user synchronization via Clerk Webhooks.
- 💬 **Direct AI Responses**: Optimized system prompts for concise, no-fluff technical answers.
- 📂 **File Upload API**: Backend infrastructure ready for Pro users to upload documents.
- 📜 **Chat History**: Backend ready for saving and retrieving chat history.

**Infrastructure:**
- 🚀 **Vercel Deployment**: Complete environment configuration and deployment guide.
- 🛡️ **Webhook Verification**: Secure Clerk webhook handling with Svix.

### Recent Updates (November 2024)

**New Capabilities:**
- 👁️ **Vision Pipeline**: Extracts structured route data from aeronautical charts (images) using Gemini Vision.
- 🔍 **Hybrid Search**: Implemented Dense + Sparse vector retrieval for precise keyword matching (e.g., "W20", "SARE").
- ⚡ **Optimized Scripts**: Unified JSON-based processing pipeline.

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
- **New Landing Page Sections:**
  - 📊 **Social Proof**: Showcases industry professionals using OACI.ai (Pilots, ATCs, Flight Schools, etc.)
  - 🎯 **Use Cases**: Clear value propositions for Students, Professionals, and Operations teams
  - ❓ **FAQ Section**: Collapsible accordion with frequently asked questions
  - ⚖️ **Legal Footer**: Privacy Policy, Terms of Service, and FAQ links
  - 🎨 **Radar Animation**: Synchronized aircraft blips on hero section
  - ✨ **About Us Enhancement**: Background glow effect with technical details

### Coming Soon

- 🔄 Android app on Play Store
- 🔄 Conversation history UI (Frontend)
- 🔄 File Upload UI for Pro Users
- 🔄 More ICAO Annexes (1, 2, 6, 14)
- 🔄 Export to PDF
- 🔄 More jurisdictions (FAA, EASA)

## ✅ TODO

- [ ] **Verify Paid Features**: Check if File Upload UI and Chat History UI are fully functional and integrated with the backend.

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
