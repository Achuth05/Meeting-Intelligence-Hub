from flask import Blueprint, request, jsonify
from ..models.db import supabase
from ..services.auth import token_required
from groq import Groq
import os
import re
import json as _json
from ..services.embedding import embed_query

chat_bp = Blueprint('chat', __name__)
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

@chat_bp.route('/chat', methods=['POST'])
@token_required
def chat_with_meeting():
    data = request.json
    meeting_id = data.get('meeting_id')
    question = data.get('question')

    if not question:
        return jsonify({'error': 'No question provided'}), 400

    try:
        # ── CASE A: Single Meeting Chat ────────────────────────────────────────
        if meeting_id:
            res = supabase.table('transcript_chunks') \
                .select('speaker, content') \
                .eq('meeting_id', meeting_id) \
                .order('chunk_index', desc=False).execute()

            if not res.data:
                return jsonify({'answer': 'No transcript data found for this meeting.'})

            context = "\n".join([f"{c['speaker']}: {c['content']}" for c in res.data])
            scope = "this specific meeting"

        # ── CASE B: Global Dashboard Chat ─────────────────────────────────────
        else:
            # i. AI decides search strategy
            router_prompt = f"""You are a search query analyzer. Given this question, decide the search strategy.

Question: "{question}"

Return ONLY JSON:
{{
  "strategy": "targeted" or "broad",
  "keywords": ["word1", "word2", "word3"]
}}

Use "broad" if the question asks for a general summary, overview, recap, or what happened recently across meetings.
Use "targeted" if the question asks about a specific topic, person, decision, technology, or event.
For "broad", keywords can be empty.
For "targeted", extract 3-5 specific content words that would appear in transcripts."""

            router_res = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": router_prompt}],
                response_format={"type": "json_object"},
                temperature=0.0
            )

            router_data = _json.loads(router_res.choices[0].message.content)
            strategy = router_data.get('strategy', 'targeted')
            dynamic_keywords = router_data.get('keywords', [])
            print(f"DEBUG: Strategy: {strategy}, Keywords: {dynamic_keywords}")

            # ii. Fetch chunks based on strategy
            if strategy == 'broad':
                # General summary — fetch all chunks directly
                all_chunks = supabase.table('transcript_chunks') \
                    .select('id, content, meeting_id, speaker') \
                    .order('chunk_index').limit(80).execute().data or []
                print(f"DEBUG: Broad fetch returned: {len(all_chunks)} chunks")

            else:
                # Targeted — vector search + keyword fallback
                query_vector = embed_query(question)
                rpc_params = {
                    'query_embedding': query_vector,
                    'match_threshold': 0.02,
                    'match_count': 40,
                    'filter_meeting_id': None
                }
                vector_res = supabase.rpc('match_chunks', rpc_params).execute()
                all_chunks = vector_res.data if vector_res.data else []
                print(f"DEBUG: Vector search returned: {len(all_chunks)} chunks")

                for word in dynamic_keywords:
                    if len(word) < 3:
                        continue
                    kw_res = supabase.table('transcript_chunks') \
                        .select('id, content, meeting_id, speaker') \
                        .ilike('content', f'%{word}%').limit(5).execute()
                    print(f"DEBUG: Keyword '{word}' returned {len(kw_res.data)} chunks")
                    if kw_res.data:
                        all_chunks.extend(kw_res.data)

            # iii. De-duplicate and map metadata
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

        # ── Final prompt ───────────────────────────────────────────────────────
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

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": final_prompt}],
            temperature=0.0
        )

        return jsonify({"answer": response.choices[0].message.content})

    except Exception as e:
        print(f"Chat Error: {str(e)}")
        return jsonify({"error": "An error occurred while processing your request."}), 500