from flask import Blueprint, jsonify
from ..models.db import supabase
from ..services.auth import token_required
from groq import Groq

sentiment_bp = Blueprint('sentiment', __name__)
client = Groq()

@sentiment_bp.route('/meetings/<meeting_id>/sentiment', methods=['GET'])
@token_required
def get_sentiment(meeting_id):
    chunks = supabase.table('transcript_chunks') \
        .select('content') \
        .eq('meeting_id', meeting_id).execute()
    
    text = " ".join([c['content'] for c in chunks.data[:10]])
    
    prompt = f"""Analyze the sentiment of this meeting transcript. 
    Return ONLY a JSON object with:
    - score: (float between -1 and 1)
    - label: (Positive, Neutral, or Negative)
    - highlights: (Brief list of 2 reasons for this score)
    
    TRANSCRIPT: {text[:5000]}"""

    try:
        resp = client.chat.completions.create(
        model="llama-3.1-8b-instant", 
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )
        return resp.choices[0].message.content
    except Exception as e:
        return jsonify({"error": str(e)}), 500