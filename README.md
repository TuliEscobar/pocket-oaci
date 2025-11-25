# OACI.ai ✈️

> **AI-Powered Aviation Regulations Assistant**  
> *Instant answers from ICAO and RAAC documents with verified sources*

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/pocket-oaci)

## 🚀 What is OACI.ai?

OACI.ai is an intelligent assistant that answers questions about aviation regulations using AI and a comprehensive database of official documents. Instead of searching through hundreds of pages of PDFs, simply ask a question and get an instant, accurate answer with source citations.

### Key Features

- ✈️ **Dual Jurisdiction Support**: ICAO (International) and RAAC (Argentina)
- 🌍 **Bilingual**: Full support for Spanish and English
- 📚 **RAG-Powered**: Answers based on official documents stored in vector database
- 🎯 **Source Citations**: Every response includes exact document references
- 💅 **Beautiful UI**: Dark mode interface with markdown-formatted responses
- ⚡ **Fast**: Responses in seconds with semantic search

## 🎯 Quick Start

### Prerequisites

- Node.js 18+ installed
- Google AI API key ([Get it free](https://aistudio.google.com/))
- Pinecone API key ([Get it free](https://www.pinecone.io/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/pocket-oaci.git
   cd pocket-oaci
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   GOOGLE_API_KEY=your_google_api_key_here
   PINECONE_API_KEY=your_pinecone_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Visit [http://localhost:3000](http://localhost:3000)

## 📦 Project Structure

```
pocket-oaci/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Internationalized pages
│   └── api/               # API routes
├── lib/rag/               # RAG service for document retrieval
├── scripts/               # Data processing pipeline
│   ├── 1-extract-pdf.ts   # Extract text from PDFs
│   ├── 2-chunk-documents.ts # Split into chunks
│   ├── 3-generate-embeddings.ts # Create vectors
│   └── 4-upload-to-pinecone.ts # Upload to database
├── data/                  # Documents and embeddings (gitignored)
├── messages/              # i18n translations (en.json, es.json)
├── components/            # React components
└── public/                # Static assets
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
  - ✅ ICAO Doc 4444 - Air Traffic Management (1,754 vectors)
  - ✅ RAAC Part 61 - Personnel Licensing (181 vectors)
  - ✅ RAAC Part 91 - General Operating Rules (569 vectors)
  - ✅ RAAC Part 65 - Aeronsautical Navigation (vectors placeholder)
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

### Current Features (v0.4)

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
