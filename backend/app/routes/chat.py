from flask import Blueprint, request, jsonify
from ..models.db import supabase
from ..services.auth import token_required
from ..services.embedding import model 
from groq import Groq
import os
import re

chat_bp = Blueprint('chat', __name__)
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

@chat_bp.route('/chat', methods=['POST'])
@token_required
def chat_with_meeting():
    data = request.json
    meeting_id = data.get('meeting_id') # Scoped to one meeting if ID exists
    question = data.get('question')
    
    if not question:
        return jsonify({'error': 'No question provided'}), 400

    try:
        # --- 1. RETRIEVAL STRATEGY ---
        
        # CASE A: Single Meeting Chat (Full Fetch for 100% Accuracy)
        if meeting_id:
            res = supabase.table('transcript_chunks') \
                .select('speaker, content') \
                .eq('meeting_id', meeting_id) \
                .order('chunk_index', desc=False).execute()
            
            if not res.data:
                return jsonify({'answer': 'No transcript data found for this meeting.'})

            context = "\n".join([f"{c['speaker']}: {c['content']}" for c in res.data])
            scope = "this specific meeting"

        # CASE B: Global Dashboard Chat (Agentic Hybrid Search)
        # CASE B: Global Dashboard Chat
        else:
            # i. AI Keyword Extraction
            router_prompt = (
                f"Extract 5 short search keywords from this question. "
                f"Return ONLY a comma-separated list of single words, nothing else. "
                f"No numbering, no explanation, no punctuation except commas. "
                f"Question: {question}"
            )
            router_res = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": router_prompt}],
                temperature=0.0
            )
            raw_keywords = router_res.choices[0].message.content.strip()
            # Clean and split
            dynamic_keywords = [
                k.strip().lower()
                for k in raw_keywords.replace('\n', ',').split(',')
                if k.strip() and len(k.strip()) >= 3
            ]
            print(f"DEBUG: Clean keywords: {dynamic_keywords}")

            # ii. Semantic Vector Search
            query_vector = model.encode(question).tolist()
            rpc_params = {
                'query_embedding': query_vector,
                'match_threshold': 0.02,
                'match_count': 40,
                'filter_meeting_id': None
            }
            vector_res = supabase.rpc('match_chunks', rpc_params).execute()
            all_chunks = vector_res.data if vector_res.data else []  # ← defined here
            print(f"DEBUG: Vector search returned: {len(all_chunks)} chunks")

            # iii. Keyword Search fallback
            for word in dynamic_keywords:
                kw_res = supabase.table('transcript_chunks') \
                    .select('id, content, meeting_id, speaker') \
                    .ilike('content', f'%{word}%').limit(5).execute()
                print(f"DEBUG: Keyword '{word}' returned {len(kw_res.data)} chunks")
                if kw_res.data:
                    all_chunks.extend(kw_res.data)

            # iv. De-duplicate and Map Metadata
            unique_chunks = list({c['id']: c for c in all_chunks}.values())
            
            if not unique_chunks:
                return jsonify({'answer': 'No relevant content found across your meetings.'})
            
            m_ids = list(set([c['meeting_id'] for c in unique_chunks]))
            m_info = supabase.table('meetings') \
                .select('id, name, meeting_date') \
                .in_('id', m_ids).execute()
            m_map = {
                m['id']: f"{m['name']} ({m['meeting_date'] if m['meeting_date'] else 'General Note'})"
                for m in m_info.data
            }

            context = "\n".join([
                f"Source [{m_map.get(c['meeting_id'], 'Unknown')}]: {c['speaker'] or 'Unknown'}: {c['content']}"
                for c in unique_chunks
            ])
            scope = "all available meetings and notes"
            # --- 2. THE FINAL REASONING ---
        final_prompt = f"""You are MeetCognit AI, a professional meeting intelligence engine.
Use the provided context to answer the user's question.

LOGIC RULES:
1. If the user asks about a specific time (e.g., "April 2024"), use the dates in the [Source] tags to build your answer.
2. If the user asks about a policy or status (e.g., "Staging Environment"), search all sources. 
3. If a source has no date or is marked 'General Note', treat it as a STANDING POLICY that applies currently.
4. If multiple meetings provide different info, prioritize the most recent date as the latest decision.
5. If the answer is not in the context, state that clearly.

CONTEXT DATA:
{context}

USER QUESTION: {question}"""

        # --- 3. GENERATE RESPONSE ---
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": final_prompt}],
            temperature=0.0
        )

        return jsonify({"answer": response.choices[0].message.content})

    except Exception as e:
        print(f"Chat Error: {str(e)}")
        return jsonify({"error": "An error occurred while processing your request."}), 500