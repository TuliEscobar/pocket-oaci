# 🔄 Hybrid RAG Pipeline Architecture

This document details the advanced **Hybrid Retrieval-Augmented Generation (RAG)** pipeline implemented in OACI.ai. This system combines **Computer Vision**, **Semantic Search**, and **Keyword Matching** to provide highly accurate answers from aeronautical regulations and charts.

---

## 🏗️ Architecture Overview

The pipeline transforms raw unstructured data (PDFs, Images) into a structured, searchable knowledge base using a multi-stage process.

### Core Components

1.  **Multi-Modal Ingestion**: Handles both text documents (PDFs) and visual charts (Images).
2.  **Hybrid Embedding**: Generates two types of vectors for each chunk:
    *   **Dense Vectors**: Capture semantic meaning (e.g., "flight rules" matches "operating limitations").
    *   **Sparse Vectors**: Capture exact keywords (e.g., "W20", "SARE", "125.10").
3.  **Vector Database**: Pinecone Serverless using `dotproduct` metric for hybrid scoring.

---

## 🚀 Pipeline Steps

### 1. Extraction (Multi-Modal)

#### A. Image Processing (`scripts/1-extract-images.ts`)
*   **Input**: `.png`, `.jpg`, `.jpeg` (Aeronautical Charts).
*   **Model**: **Gemini 2.0 Flash Experimental** (Vision capabilities).
*   **Prompting**: Specialized prompt to extract:
    *   **Airways**: Names (e.g., W20, UW782).
    *   **Waypoints**: Sequential list of points (e.g., SIS -> OPKAN -> ITADO).
    *   **Frequencies**: Radio communication frequencies.
*   **Output**: Structured JSON with `images[].structuredData`.

#### B. PDF Processing (`scripts/1-extract-pdf-enhanced.ts`)
*   **Input**: `.pdf` (Regulations, Annexes).
*   **Method**: `pdf-parse` for text extraction.
*   **Logic**: Heuristics to detect if a page is a chart or text.
*   **Output**: Cleaned text JSON.

### 2. Enrichment (`scripts/2-enrich-data.ts`)
*   **Goal**: Normalize entities to improve searchability.
*   **Action**: Replaces raw codes with full context.
    *   *Example*: "SIS" → "RESISTENCIA/SIS/SARE".
    *   *Example*: "AER" → "AEROPARQUE/AER/SABE".

### 3. Chunking (`scripts/3-chunk-text.ts`)
*   **Strategy**: Semantic chunking based on document structure (Sections, Chapters).
*   **Size**: ~500 words per chunk with overlap to maintain context.

### 4. Hybrid Embedding Generation (`scripts/4-generate-embeddings.ts`)

This is the most critical step for accuracy.

#### Dense Embeddings
*   **Model**: `text-embedding-004` (Google).
*   **Dimension**: 768 floats.
*   **Purpose**: Understanding intent and context.

#### Sparse Embeddings (Custom Implementation)
*   **Method**: **TF-Hashing** (Term Frequency with Hashing).
*   **Logic**:
    1.  Tokenize text and remove stopwords.
    2.  Count term frequency (TF).
    3.  Hash tokens to indices (Dimension: 10,000).
*   **Purpose**: Exact matching of codes, flight numbers, and frequencies that semantic models might miss.

### 5. Indexing (`scripts/5-upload-to-pinecone.ts`)
*   **Destination**: Pinecone Index `oaci-docs`.
*   **Metric**: `dotproduct` (Required for hybrid search).
*   **Payload**:
    *   `values`: Dense Vector.
    *   `sparseValues`: { indices: [...], values: [...] }.
    *   `metadata`: Text content + Source info.

---

## 🔍 Retrieval Strategy (At Runtime)

When a user asks a question (e.g., *"Ruta de Resistencia a Aeroparque"*):

1.  **Query Embedding**:
    *   Generate Dense Vector for the query.
    *   Generate Sparse Vector for the query.
2.  **Hybrid Search**:
    *   Pinecone calculates a combined score: `alpha * dense_score + (1 - alpha) * sparse_score`.
    *   This ensures we find documents that match the *meaning* AND contain the specific *keywords* (like "Resistencia").
3.  **Generation**:
    *   Top 8 chunks are sent to Gemini 2.0 Flash.
    *   Model generates the answer using the retrieved context.

---

## 🛠️ Maintenance

### Adding New Charts
1.  Save chart image as PNG/JPG in `data/raw`.
2.  Run `npx ts-node scripts/1-extract-images.ts`.
3.  Run the rest of the pipeline (steps 2-5).

### Updating Regulations
1.  Save PDF in `data/raw`.
2.  Run `npx ts-node scripts/1-extract-pdf-enhanced.ts`.
3.  Run the rest of the pipeline.
