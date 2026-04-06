# MeetCognit

## Project Title
MeetCognit — AI-powered meeting transcript analysis and knowledge retrieval system.

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
- Hugging Face Inference API (all-MiniLM-L6-v2) — Cloud-based sentence embeddings for  high-speed vector search and RAG.

**Libraries**
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
git clone https://github.com/Achuth05/Meeting-Intelligence-Hub.git
cd Meeting-intelligence-Hub
```

### 2. Backend setup
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

python -m pip install -r requirements.txt
```
### 3. Environment variables
Create a `.env` file inside the `backend` folder:
```
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxx
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJxxxxxxxxxx
FLASK_SECRET_KEY=anyrandomstring
FRONTEND_URL=http://localhost:5173
HF_API_TOKEN=xxxxxxxxxxxx
```
### 4. Supabase database setup
Go to your Supabase project → SQL Editor and run the following:
```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE meetings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  project text,
  created_at timestamptz DEFAULT now(),
  word_count integer,
  speakers jsonb,
  meeting_date date,
  sentiment_score float
);

CREATE TABLE transcript_chunks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id uuid REFERENCES meetings(id) ON DELETE CASCADE,
  chunk_index integer,
  content text,
  speaker text,
  timestamp text,
  embedding vector(384)
);

CREATE TABLE action_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id uuid REFERENCES meetings(id) ON DELETE CASCADE,
  type text CHECK(type IN ('decision', 'action_item')),
  description text,
  owner text,
  due_date text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX ON transcript_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 50);
CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding vector(384),
  match_threshold float,
  match_count int,
  filter_meeting_id uuid DEFAULT null
)
RETURNS TABLE(id uuid, content text, meeting_id uuid, speaker text, similarity float)
LANGUAGE sql STABLE
AS $$
  SELECT id, content, meeting_id, speaker,
    1 - (embedding <=> query_embedding) AS similarity
  FROM transcript_chunks
  WHERE (filter_meeting_id IS null OR meeting_id = filter_meeting_id)
    AND 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;
```
### 5. Run the backend
```bash
cd backend
python run.py
```
Backend runs at `http://localhost:5000`
Verify at `http://localhost:5000/health` — should return `{"status": "ok"}`

### 6. Frontend setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`

