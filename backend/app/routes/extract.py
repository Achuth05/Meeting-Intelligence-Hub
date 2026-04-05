from flask import Blueprint, jsonify
from ..models.db import supabase
from ..services.llm import extract_actions
from ..services.auth import token_required

extract_bp = Blueprint('extract', __name__)
@extract_bp.route('/meetings/<meeting_id>/extract', methods=['POST'])
@token_required
def extract(meeting_id):
    # Fetch full transcript text from DB with speaker labels
    chunks = supabase.table('transcript_chunks') \
        .select('speaker, content').eq('meeting_id', meeting_id) \
        .order('chunk_index').execute()

    print(f"DEBUG: Found {len(chunks.data)} chunks for meeting {meeting_id}")
    
    # Reconstruct transcript with speaker labels
    full_text = ' '.join(
        f"{c['speaker']}: {c['content']}" if c['speaker'] 
        else c['content'] 
        for c in chunks.data
    )
    print(f"DEBUG: Full transcript length: {len(full_text)} chars")
    print(f"DEBUG: Transcript preview: {full_text[:500]}")
    
    result = extract_actions(full_text)
    print(f"DEBUG: Extract result: {result}")

    # Store in DB
    rows = []
    for d in result.get('decisions', []):
        rows.append({'meeting_id': meeting_id, 'type': 'decision', 'description': d['description']})
    for a in result.get('action_items', []):
        rows.append({'meeting_id': meeting_id, 'type': 'action_item',
                     'description': a['description'], 'owner': a.get('owner'),
                     'due_date': a.get('due_date')})
    if rows:
        supabase.table('action_items').delete().eq('meeting_id', meeting_id).execute()
        supabase.table('action_items').insert(rows).execute()

    return jsonify(result)