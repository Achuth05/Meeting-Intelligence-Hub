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

        # Save to temp, parse, embed, store
        with tempfile.NamedTemporaryFile(suffix=f'.{ext}', delete=False) as tmp:
            tmp_path = tmp.name
            file.save(tmp_path)

        # File is now closed — safe to use and delete on Windows
        parsed = parse_transcript(tmp_path, ext)
        print(f"DEBUG: Parsed chunks count: {len(parsed['chunks'])}")
        print(f"DEBUG: Parsed speakers: {parsed['speakers']}")
        print(f"DEBUG: Word count: {parsed['word_count']}")
        
        os.unlink(tmp_path)

        # Insert meeting record
        meeting = supabase.table('meetings').insert({
            'name': file.filename,
            'project': project,
            'user_id': request.user_id,
            'word_count': parsed['word_count'],
            'speakers': parsed['speakers'],
            'meeting_date': parsed['meeting_date'],
        }).execute()

        meeting_id = meeting.data[0]['id']

        # Chunk → embed → store in Supabase
        chunks = chunk_text(parsed['chunks'])
        print(f"DEBUG: After chunk_text: {len(chunks)} chunks")
        
        embedded = embed_chunks(chunks)
        print(f"DEBUG: After embed_chunks: {len(embedded)} chunks with embeddings")

        # Format rows for Supabase - convert embeddings to list format
        rows = []
        for i, c in enumerate(embedded):
            row = {
                'meeting_id': meeting_id,
                'chunk_index': i,
                'content': c['content'],
                'speaker': c['speaker'] or 'Unknown',
                'timestamp': c['timestamp'] or '00:00:00'
            }
            rows.append(row)

        print(f"DEBUG: About to insert {len(rows)} rows")
        if rows:
            print(f"DEBUG: Sample row: {rows[0]}")
        else:
            print("DEBUG: WARNING - no rows to insert!")
            # Still add the meeting even if no chunks
            uploaded.append({'meeting_id': meeting_id, 'filename': file.filename,
                              'speakers': parsed['speakers'], 'word_count': parsed['word_count']})
            continue
        
        try:
            # Try inserting without embeddings first (simplest case)
            result = supabase.table('transcript_chunks').insert(rows).execute()
            print(f"Successfully inserted {len(rows)} chunks")
        except Exception as e:
            print(f"Insert failed: {e}")
            print(f"Error type: {type(e).__name__}")
            raise
                
        uploaded.append({'meeting_id': meeting_id, 'filename': file.filename,
                          'speakers': parsed['speakers'], 'word_count': parsed['word_count']})

    return jsonify({'success': True, 'uploaded': uploaded}), 201