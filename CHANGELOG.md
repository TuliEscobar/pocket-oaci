# 📝 Changelog - OACI.ai

All notable changes to this project will be documented in this file.

## [0.7.0] - 2024-11-27 - Streaming & Performance Update

### 🚀 Major Performance Improvements

**Response Time Optimization:**
- Implemented **streaming responses** using NDJSON format
- Reduced total response time from **29s to 11s** (60% faster)
- Time to first token: **6 seconds** (user sees response immediately)
- Switched from Gemini 2.5 Pro to **Gemini 2.0 Flash Experimental**

**Technical Changes:**
- Added `ReadableStream` API for real-time text streaming
- Implemented NDJSON (Newline Delimited JSON) protocol
- Frontend now consumes stream chunks progressively
- Reduced context retrieval from 12 to 8 chunks (topK: 8)

**Performance Breakdown:**
```
Embedding Generation:    1-2s
Pinecone Query:          1-2s  
LLM Initialization:      <1s
Time to First Token:     ~6s  ← User sees response here
Total Time:              ~11s
```

### ✨ UI/UX Enhancements

**Source Citations Redesign:**
- Smart grouping: Documents no longer repeat
- Shows reference count per document (e.g., "3 references")
- Displays section count (e.g., "2 sections")
- Calculates average relevance score per document
- Premium card design with gradient backgrounds
- Hover effects with cyan/blue glow
- Animated pulsing indicators
- Gradient progress bars (cyan-to-blue)
- SVG icons for better visual hierarchy

**Before:**
```
RAAC PART 61 - Section 1.1
RAAC PART 61 - Section 1.2  
RAAC PART 61 - Section 2.3
ICAO DOC 8168
ICAO DOC 8168
```

**After:**
```
RAAC PART 61 (3 references, 2 sections) - 95% relevance
ICAO DOC 8168 (2 references) - 87% relevance
```

### 🔧 Developer Experience

**New Tools:**
- Added `scripts/test-rag-speed.ts` for performance testing
- Comprehensive logging with `console.time()` measurements
- Detailed timing breakdown for each RAG pipeline step

**Logging Output:**
```
[RAG] Starting query...
[RAG] Embedding Generation: 1.531s
[RAG] Pinecone Query: 1.183s
[RAG] LLM Initialization: 875ms
[RAG] Setup execution time: 6141ms
⚡ Time to First Token: 6145ms
⏱️  Total Time: 11479ms
```

### 📚 Documentation Updates

- Updated README.md with performance metrics
- Added streaming architecture diagram
- Documented before/after comparison table
- Added performance metrics section
- Updated tech stack with Gemini 2.0 Flash

### 🐛 Bug Fixes

- Fixed model compatibility issues with streaming API
- Resolved NDJSON parsing edge cases
- Fixed duplicate source display

---

## [0.6.0] - 2024-11-25 - Authentication & Social Launch

### 🔐 Authentication

- Integrated Clerk for user authentication
- Added Google Sign-In support
- Protected chat endpoint (requires authentication)
- Custom Clerk styling with dark theme
- Automatic language switching (ES/EN)

### 🎨 Branding & UI

- New "OACI de Bolsillo" / "Pocket OACI" branding
- Document ticker component on landing page
- Improved landing page with CTA
- Vercel Analytics integration

### 📱 Social Media

- Created LinkedIn company page strategy
- Developed social media content plan
- Prepared launch posts for X (Twitter) and LinkedIn

---

## [0.5.0] - 2024-11-24 - Argentina Market Expansion

### 🇦🇷 Argentine Regulations

- Added RAAC (Argentine regulations) support
- Processed 4 RAAC documents (Parts 61, 65, 91, 135)
- Implemented jurisdiction selector (ICAO/ARG)
- Backend prioritizes Argentine regulations when selected
- Spanish language default for ARG jurisdiction

### 📊 Database Expansion

- Increased vector database to 7,709 chunks
- Added Argentine AIP documentation
- Added ANAC procedures (PROGEN ATM, PROGEN ARO, PR GOPE 069)

---

## [0.4.0] - 2024-11-24 - RAG Implementation

### 🧠 RAG System

- Implemented complete RAG pipeline
- Connected Gemini AI to Pinecone vector database
- Added source citations with relevance scores
- Markdown response formatting
- Exact document references

### 🗄️ Vector Database

- Set up Pinecone serverless index
- Processed ICAO documents
- Generated embeddings with text-embedding-004
- Implemented semantic search

---

## [0.3.0] - 2024-11-26 - Android App

### 📱 Mobile Application

- Created Android app using Capacitor
- Hybrid architecture (web + native)
- Connects to Vercel backend
- Clerk authentication integration
- Network security configuration

### 📖 Documentation

- Complete Android setup guide
- Build instructions
- Deployment documentation

---

## [0.2.0] - Initial Features

### ✨ Core Features

- Next.js 16 with App Router
- Gemini AI integration
- Bilingual support (EN/ES)
- Voice input support
- Responsive design
- Dark mode

---

## Performance Comparison

| Version | Response Time | First Token | Model | Streaming |
|---------|---------------|-------------|-------|-----------|
| 0.6.0 | ~29s | 29s | Gemini 2.5 Pro | ❌ |
| 0.7.0 | ~11s | 6s | Gemini 2.0 Flash | ✅ |

**Improvement: 60% faster total time, 79% faster time to first token**

---

For more details, see the [README.md](./README.md) and [RAG_IMPLEMENTATION.md](./RAG_IMPLEMENTATION.md).
