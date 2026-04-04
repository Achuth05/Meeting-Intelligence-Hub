from flask import Blueprint, request, jsonify
from ..models.db import supabase
from ..services.parser import parse_transcript
from ..services.embedding import chunk_text, embed_chunks
from ..services.auth import token_required
import os, uuid, tempfile, json

upload_bp = Blueprint('upload', __name__)

ALLOWED = {'txt', 'vtt'}

@upload_bp.route('/upload', methods=['POST'])
@token_required
def upload_transcripts():
    if 'files' not in request.files:
        return jsonify({'error': 'No files provided'}), 400

    project = request.form.get('project', 'Untitled Project')
    uploaded = []

    for file in request.files.getlist('files'):
        ext = file.filename.rsplit('.', 1)[-1].lower()
        if ext not in ALLOWED:
            return jsonify({'error': f'{file.filename} is not a supported format (.txt, .vtt)'}), 422

        with tempfile.NamedTemporaryFile(suffix=f'.{ext}', delete=False) as tmp:
            tmp_path = tmp.name
            file.save(tmp_path)

        # 1. Parse the file
        parsed = parse_transcript(tmp_path, ext, file.filename)
        os.unlink(tmp_path)

        # 2. Insert the main meeting record
        meeting = supabase.table('meetings').insert({
            'name': file.filename,
            'project': project,
            'user_id': request.user_id,
            'word_count': parsed['word_count'],
            'speakers': parsed['speakers'],
            'meeting_date': parsed['meeting_date'],
        }).execute()

        meeting_id = meeting.data[0]['id']

        # 3. CHUNK & EMBED (The "Intelligence" Layer)
        # We take the raw parsed chunks and turn them into logical 300-token blocks
        chunks = chunk_text(parsed['chunks'])
        
        # We generate the vector embeddings (the 'DNA' of the text)
        embedded_chunks = embed_chunks(chunks)

        # 4. Format rows including the VECTORS
        rows = []
        rows = [{
            'meeting_id': meeting_id,
            'chunk_index': i,
            'content': c['content'],
            'speaker': c['speaker'],
            'timestamp': c['timestamp'],
            'embedding': list(c['embedding'])  # ← explicit list conversion
        } for i, c in enumerate(embedded_chunks)]

        if rows:
            try:
                # 5. Bulk insert everything including the embeddings
                supabase.table('transcript_chunks').insert(rows).execute()
                print(f"Successfully stored {len(rows)} vector-enabled chunks for {file.filename}")
            except Exception as e:
                print(f"Vector Insert failed: {e}")
                return jsonify({'error': 'Failed to store vector data', 'details': str(e)}), 500
        
        uploaded.append({
            'meeting_id': meeting_id, 
            'filename': file.filename,
            'speakers': parsed['speakers'], 
            'word_count': parsed['word_count']
        })

    return jsonify({'success': True, 'uploaded': uploaded}), 201