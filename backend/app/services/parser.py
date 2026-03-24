import webvtt, re
from datetime import datetime

def parse_transcript(filepath: str, filetype: str) -> dict:
    """Returns {text, speakers, word_count, meeting_date, chunks}"""
    if filetype == 'vtt':
        return _parse_vtt(filepath)
    elif filetype == 'txt':
        return _parse_txt(filepath)
    else:
        raise ValueError(f"Unsupported format: {filetype}")

def _parse_vtt(filepath):
    chunks = []
    speakers = set()
    for caption in webvtt.read(filepath):
        text = caption.text.strip()
        speaker, content = _extract_speaker(text)
        if speaker: speakers.add(speaker)
        chunks.append({
            'speaker': speaker,
            'content': content,
            'timestamp': caption.start
        })
    full_text = ' '.join(c['content'] for c in chunks)
    return {
        'text': full_text,
        'speakers': list(speakers),
        'word_count': len(full_text.split()),
        'chunks': chunks,
        'meeting_date': str(datetime.today().date())
    }

def _parse_txt(filepath):
    with open(filepath, 'r') as f:
        lines = f.readlines()
    chunks, speakers = [], set()
    for line in lines:
        line = line.strip()
        if not line: continue
        speaker, content = _extract_speaker(line)
        if speaker: speakers.add(speaker)
        chunks.append({'speaker': speaker, 'content': content, 'timestamp': None})
    full_text = ' '.join(c['content'] for c in chunks)
    return {'text': full_text, 'speakers': list(speakers),
            'word_count': len(full_text.split()), 'chunks': chunks,
            'meeting_date': str(datetime.today().date())}

def _extract_speaker(line):
    m = re.match(r'^([A-Z][a-zA-Z\s]+):\s*(.+)', line)
    if m: return m.group(1).strip(), m.group(2).strip()
    return None, line