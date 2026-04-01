# Meeting Intelligence Hub

## Project Title
Meeting Intelligence Hub — AI-powered meeting transcript analysis and knowledge retrieval system.

## The Problem
Organizations hold dozens of meetings every week, generating hours of transcript content that nobody has time to read. Critical decisions, action items, and strategic reasoning get buried in pages of dialogue, forcing teams into repeated "what happened in that meeting?" conversations that waste time and slow execution.

## The Solution
Meeting Intelligence Hub transforms raw meeting transcripts into structured, queryable knowledge. Users upload `.txt` or `.vtt` transcript files and the system automatically extracts decisions and action items, analyzes speaker sentiment, and enables natural language Q&A across all uploaded meetings using a RAG (Retrieval-Augmented Generation) pipeline. Every answer is cited back to the original transcript.

Key features:
- Multi-transcript upload portal with file validation
- Automatic extraction of decisions and action items with owner and due date
- Contextual chatbot that answers questions across all meetings with source citations
- Speaker sentiment and tone analysis with visual dashboard
- Export decisions and action items as CSV or PDF

## Tech Stack

**Languages**
- Python 3.13
- JavaScript (React)

**Frameworks**
- Flask — backend REST API
- React + Vite — frontend UI
- Tailwind CSS — styling

**Database**
- Supabase (PostgreSQL + pgvector) — transcript storage, action items, vector embeddings

**AI / APIs**
- Groq API (llama-3.3-70b-versatile) — LLM for extraction, chatbot, sentiment analysis
- sentence-transformers (all-MiniLM-L6-v2) — local text embeddings for vector search

**Libraries**
- sentence-transformers — local embedding model
- pandas — CSV export
- reportlab — PDF export
- react-dropzone — drag and drop file upload
- recharts — sentiment visualization charts
- axios — HTTP client

## Setup Instructions

### Prerequisites
- Python 3.10 or higher
- Node.js 18 or higher
- A Supabase account (free tier works)
- A Groq API key (free at console.groq.com)

### 1. Clone the repository
```bash