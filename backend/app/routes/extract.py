from flask import Blueprint, jsonify
from ..models.db import supabase
from ..services.llm import extract_actions

extract_bp = Blueprint('extract', __name__)
@extract_bp.route('/meetings/<meeting_id>/extract', methods=['POST'])
def extract(meeting_id):
    # Fetch full transcript text from DB
    chunks = supabase.table('transcript_chunks') \
        .select('content').eq('meeting_id', meeting_id) \
        .order('chunk_index').execute()

    full_text = ' '.join(c['content'] for c in chunks.data)
    result = extract_actions(full_text)

    # Store in DB
    rows = []
    for d in result.get('decisions', []):
        rows.append({'meeting_id': meeting_id, 'type': 'decision', 'description': d['description']})
    for a in result.get('action_items', []):
        rows.append({'meeting_id': meeting_id, 'type': 'action_item',
                     'description': a['description'], 'owner': a.get('owner'),
                     'due_date': a.get('due_date')})
    if rows:
        supabase.table('action_items').insert(rows).execute()

    return jsonify(result)