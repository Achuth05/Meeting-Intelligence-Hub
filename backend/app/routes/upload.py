from flask import Blueprint, request, jsonify
from ..models.db import supabase
from ..services.parser import parse_transcript
from ..services.embeddings import chunk_text, embed_chunks
import os, uuid, tempfile

upload_bp = Blueprint('upload', __name__)

ALLOWED = {'txt', 'vtt'}

@upload_bp.route('/upload', methods=['POST'])
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
            file.save(tmp.name)
            parsed = parse_transcript(tmp.name, ext)
            os.unlink(tmp.name)

        # Insert meeting record
        meeting = supabase.table('meetings').insert({
            'name': file.filename,
            'project': project,
            'word_count': parsed['word_count'],
            'speakers': parsed['speakers'],
            'meeting_date': parsed['meeting_date'],
        }).execute()

        meeting_id = meeting.data[0]['id']

        # Chunk → embed → store in Supabase
        chunks = chunk_text(parsed['chunks'])
        embedded = embed_chunks(chunks)

        rows = [{
            'meeting_id': meeting_id,
            'chunk_index': i,
            'content': c['content'],
            'speaker': c['speaker'],
            'timestamp': c['timestamp'],
            'embedding': c['embedding']
        } for i, c in enumerate(embedded)]

        supabase.table('transcript_chunks').insert(rows).execute()
        uploaded.append({'meeting_id': meeting_id, 'filename': file.filename,
                          'speakers': parsed['speakers'], 'word_count': parsed['word_count']})

    return jsonify({'success': True, 'uploaded': uploaded}), 201