# OACI.ai (Pocket OACI) ✈️

> **The Pocket Bible for Global Aviation.**
> *Instant, AI-driven regulatory knowledge for pilots, ATCs, and aviation professionals.*

## 📂 Project Structure
The project is located in the `pocket-oaci` folder. You must be inside this folder to run commands.

```text
OACI.ai/
└── pocket-oaci/       <-- 🛑 RUN COMMANDS HERE
    ├── app/           # Next.js App Router (Frontend)
    ├── lib/rag/       # RAG service for document retrieval
    ├── scripts/       # Data processing pipeline
    ├── data/          # ICAO documents and embeddings
    ├── messages/      # Translation files (en.json, es.json)
    ├── public/        # Static assets
    └── package.json   # Dependencies and scripts
```

## 🚀 How to Run (Quick Start)

1.  **Open your terminal.**
2.  **Navigate to the project folder:**
    ```bash
    cd pocket-oaci
    ```
    *(If you are in `OACI.ai`, you must type `cd pocket-oaci` first)*
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Configure your API Keys:**
    - Create a file named `.env.local` in the `pocket-oaci` folder.
    - Add your API keys:
      ```env
      GOOGLE_API_KEY=your_google_api_key_here
      PINECONE_API_KEY=your_pinecone_api_key_here
      ```
    - Get your free Google AI API key at [Google AI Studio](https://aistudio.google.com/)
    - Get your free Pinecone API key at [Pinecone.io](https://www.pinecone.io/)
5.  **Start the development server:**
    ```bash
    npm run dev
    ```
6.  **Open the App:**
    Visit [http://localhost:3000](http://localhost:3000) in your browser.

## 🌍 Features

### ✅ Current Features (v0.2 - RAG Enabled)
- **"Black Box" Interface**: A distraction-free, dark mode UI designed for the cockpit
- **Bilingual Core**: Full support for **Spanish (ES)** and **English (EN)**
- **RAG-Powered Responses**: Answers based on **official ICAO documents** stored in Pinecone
- **Smart Document Retrieval**: Uses semantic search to find the most relevant passages
- **Source Citations**: Every response includes references to specific ICAO documents
- **Graceful Fallback**: If RAG is unavailable, falls back to standard Gemini responses
- **1,754 Vectors**: Currently loaded with ICAO Doc 4444 (Air Traffic Management)

### 🔄 RAG Pipeline
The system uses a complete RAG (Retrieval-Augmented Generation) pipeline:
1. **PDF Extraction** → Extract text from ICAO PDFs
2. **Chunking** → Split documents into semantic chunks (~500 words)
3. **Embedding** → Generate vectors using Google's text-embedding-004
4. **Vector Storage** → Store in Pinecone for fast similarity search
5. **Retrieval** → Find top 5 most relevant chunks for each query
6. **Generation** → Gemini 2.5 Pro generates contextual answers

## 🛠️ Tech Stack
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **AI Model**: [Google Gemini 2.5 Pro](https://ai.google.dev/)
- **Embeddings**: Google text-embedding-004 (768 dimensions)
- **Vector Database**: [Pinecone](https://www.pinecone.io/) (Serverless)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Internationalization**: `next-intl`
- **PDF Processing**: pdf-parse

## 📖 Documentation
- **[RAG_IMPLEMENTATION.md](./RAG_IMPLEMENTATION.md)**: Complete RAG system architecture and setup guide
- **[RAG_QUICKSTART.md](./RAG_QUICKSTART.md)**: Quick reference for RAG pipeline
- **[VISIONARY_ROADMAP.md](./VISIONARY_ROADMAP.md)**: Long-term strategy (MVP → National Regs → Ecosystem)
- **[MVP_PRESENTATION_GUIDE.md](./MVP_PRESENTATION_GUIDE.md)**: Presentation script for investors/users
- **[UI_MOCKUP.md](./UI_MOCKUP.md)**: Original visual concept

## 🎯 Next Steps & Roadmap

### 🔥 High Priority
1. **Enhanced Citation Display**
   - Show specific section references (e.g., "Doc 4444, ENR 2.3.3 - Visual Flight Rules")
   - Display confidence scores for each source
   - Add "View Source" links to jump to exact document sections
   - Highlight which parts of the answer came from which sources

2. **Add More ICAO Documents**
   - Anexo 1 - Licencias al Personal
   - Anexo 6 - Operación de Aeronaves
   - Anexo 2 - Reglamento del Aire
   - Anexo 14 - Aeródromos
   - Doc 8168 - PANS-OPS

3. **Improve Response Quality**
   - Fine-tune chunking strategy for better context preservation
   - Implement hybrid search (semantic + keyword)
   - Add re-ranking of search results
   - Cache frequently asked questions

### 📊 Medium Priority
4. **UI/UX Enhancements**
   - Add source preview cards with expandable details
   - Implement "Ask follow-up" feature
   - Add document browser to explore available sources
   - Show loading states with "Searching documents..." feedback

5. **Analytics & Monitoring**
   - Track which documents are most queried
   - Monitor RAG retrieval quality
   - Log failed queries for improvement
   - Add usage analytics dashboard

6. **Performance Optimization**
   - Implement response streaming for faster perceived performance
   - Add caching layer for common queries
   - Optimize embedding generation batch processing
   - Reduce API costs with smart caching

### 🚀 Future Enhancements
7. **Multi-Document Synthesis**
   - Combine information from multiple ICAO documents
   - Cross-reference related regulations
   - Detect and highlight contradictions or updates

8. **Conversation Memory**
   - Remember context from previous questions in session
   - Allow multi-turn clarification questions
   - Implement conversation history

9. **Advanced Features**
   - Voice input for hands-free operation (cockpit use)
   - Offline mode with local vector database
   - Export answers as PDF reports with citations
   - Integration with flight planning tools

10. **Localization**
    - Add French (ICAO official language)
    - Add Portuguese for Latin America
    - Support for national regulations (FAA, EASA, etc.)

## 🗂️ Current Database Status
- **Pinecone Index**: `oaci-docs`
- **Total Vectors**: 1,754
- **Documents Loaded**: 
  - ✅ ICAO Doc 4444 - Air Traffic Management
- **Embedding Model**: text-embedding-004 (768 dimensions)
- **Cost**: $0/month (within free tiers)

---
*Built with ❤️ for the skies.*
