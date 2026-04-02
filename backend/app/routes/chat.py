from flask import Blueprint, request, jsonify
from ..models.db import supabase
from ..services.auth import token_required
from groq import Groq
import os

chat_bp = Blueprint('chat', __name__)
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

@chat_bp.route('/chat', methods=['POST'])
@token_required
def chat_with_meeting():
    data = request.json
    meeting_id = data.get('meeting_id')
    question = data.get('question')
    history = data.get('history', []) 

    chunks = supabase.table('transcript_chunks') \
        .select('speaker, content') \
        .eq('meeting_id', meeting_id) \
        .order('chunk_index').execute()
    
    context = "\n".join([f"{c['speaker']}: {c['content']}" for c in chunks.data])

    prompt = f"""You are MeetCognit AI. Use the transcript below to answer the user's question. 
    Focus on logic, decisions, and evidence. If the answer isn't in the text, say so.
    
    TRANSCRIPT:
    {context[:12000]} 

    QUESTION: {question}"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2
        )
        return jsonify({"answer": response.choices[0].message.content})
    except Exception as e:
        return jsonify({"error": str(e)}), 500