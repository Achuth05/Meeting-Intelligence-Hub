import webvtt, re
from datetime import datetime

def _extract_date_from_filename(filename: str) -> str | None:
    m = re.search(r'(\d{4}-\d{2}-\d{2})', filename)
    if m:
        try:
            datetime.strptime(m.group(1), '%Y-%m-%d')
            return m.group(1)
        except: pass
    m = re.search(
        r'(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s_\-](\d{1,2})[\s_\-](\d{4})',
        filename.lower()
    )
    if m:
        try:
            date = datetime.strptime(f"{m.group(1)} {m.group(2)} {m.group(3)}", "%b %d %Y")
            return str(date.date())
        except: pass
    m = re.search(r'(\d{2})[\-_](\d{2})[\-_](\d{4})', filename)
    if m:
        try:
            date = datetime.strptime(f"{m.group(1)}-{m.group(2)}-{m.group(3)}", "%d-%m-%Y")
            return str(date.date())
        except: pass

    return None


def _extract_date_from_content(text: str) -> str | None:
    head = text[:300].lower()
    m = re.search(r'(?:meeting\s*date|date)[:\s]+(\d{4}-\d{2}-\d{2})', head)
    if m:
        return m.group(1)
    m = re.search(
        r'(january|february|march|april|may|june|july|august|september|october|november|december)'
        r'\s+(\d{1,2}),?\s+(\d{4})',
        head
    )
    if m:
        try:
            date = datetime.strptime(f"{m.group(1)} {m.group(2)} {m.group(3)}", "%B %d %Y")
            return str(date.date())
        except: pass
    m = re.search(r'(\d{4}-\d{2}-\d{2})', head)
    if m:
        try:
            datetime.strptime(m.group(1), '%Y-%m-%d')
            return m.group(1)
        except: pass

    return None

def get_meeting_date(filename: str, text: str) -> str:
    date = _extract_date_from_content(text)
    if date:
        return date
    date = _extract_date_from_filename(filename)
    if date:
        return date
    return str(datetime.today().date())


def parse_transcript(filepath: str, filetype: str, original_filename: str = '') -> dict:
    if filetype == 'vtt':
        return _parse_vtt(filepath, original_filename)
    elif filetype == 'txt':
        return _parse_txt(filepath, original_filename)
    else:
        raise ValueError(f"Unsupported format: {filetype}")

def _extract_speaker(line):
    m = re.match(r'^([A-Z][a-zA-Z\s]+):\s*(.+)', line)
    if m: return m.group(1).strip(), m.group(2).strip()
    return None, line

def _parse_vtt(filepath, original_filename=''):
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
        'meeting_date': get_meeting_date(original_filename, full_text)  # ← original name
    }


def _parse_txt(filepath, original_filename=''):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    chunks, speakers = [], set()
    current_speaker = None  # Tracks the active speaker across lines
    for line in lines:
        line = line.strip()
        if not line: 
            continue
        new_speaker, content = _extract_speaker(line)
        if new_speaker:
            current_speaker = new_speaker
            speakers.add(current_speaker)
        chunks.append({
            'speaker': current_speaker, 
            'content': content, 
            'timestamp': None
        })
    full_text = ' '.join(c['content'] for c in chunks)
    return {
        'text': full_text,
        'speakers': list(speakers),
        'word_count': len(full_text.split()),
        'chunks': chunks,
        'meeting_date': get_meeting_date(original_filename, full_text)
    }