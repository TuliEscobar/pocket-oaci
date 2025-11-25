# Implementation Plan - Pocket OACI MVP

# Goal Description
Build the Minimum Viable Product (MVP) for **OACI.ai** (Pocket OACI). The goal is to create a premium-feeling web application that allows aviation professionals to query ICAO documentation using natural language.

## User Review Required
> [!IMPORTANT]
> **Content Availability**: We do not have the actual full text of ICAO Annexes 1-19 available in the workspace. The MVP will use **simulated/placeholder data** (e.g., excerpts or summaries) to demonstrate the functionality. The user will need to provide the actual PDF/Text files later for full ingestion.

## Proposed Changes

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Framer Motion (for the "Premium/Jeff Bezos" feel)
- **Internationalization**: `next-intl` (Spanish/English support)
- **AI/Backend**: Next.js API Routes + OpenAI (or Gemini) SDK for RAG (Retrieval Augmented Generation).

### Structure
#### [NEW] [oaci-web](file:///C:/Users/tulie/.gemini/antigravity/scratch/oaci-web)
We will create a new Next.js project in `oaci-web`.

#### [NEW] [ingest_data.ts](file:///C:/Users/tulie/.gemini/antigravity/scratch/oaci-web/scripts/ingest_data.ts)
A script to parse documentation and prepare it for the vector search (simulated for now).

#### [NEW] [route.ts](file:///C:/Users/tulie/.gemini/antigravity/scratch/oaci-web/app/api/chat/route.ts)
The API endpoint that handles user queries, searches the documentation, and generates a response.

#### [NEW] [page.tsx](file:///C:/Users/tulie/.gemini/antigravity/scratch/oaci-web/app/[locale]/page.tsx)
The main landing page and chat interface. Design focus: Dark mode, clean typography, "Cockpit" aesthetic. Includes a language switcher (ES/EN).

## Verification Plan

### Automated Tests
- **Build Check**: Run `npm run build` to ensure the Next.js app compiles without errors.
- **Lint Check**: Run `npm run lint`.

### Manual Verification
- **UI UX**: Open the web app locally. Verify the "Premium" feel (animations, colors).
- **Chat Flow**:
    1.  Enter a question: "What is the standard holding speed?"
    2.  Verify the system returns a simulated answer with a "Citation" (e.g., "According to Annex X...").
