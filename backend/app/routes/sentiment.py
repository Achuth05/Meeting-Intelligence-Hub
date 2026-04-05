from flask import Blueprint, jsonify
from ..models.db import supabase
from ..services.auth import token_required
from ..services.llm import analyze_sentiment

sentiment_bp = Blueprint('sentiment', __name__)

@sentiment_bp.route('/meetings/<meeting_id>/sentiment', methods=['GET'])
@token_required
def get_sentiment(meeting_id):
    chunks = supabase.table('transcript_chunks') \
        .select('content, speaker') \
        .eq('meeting_id', meeting_id).execute()

    if not chunks.data:
        return jsonify({'error': 'No transcript data found'}), 404

    text = "\n".join([
        f"{c['speaker'] or 'Unknown'}: {c['content']}"
        for c in chunks.data[:15]
    ])

    result = analyze_sentiment(text)
    return jsonify(result)