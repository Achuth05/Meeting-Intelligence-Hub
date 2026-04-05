import os
from sentence_transformers import SentenceTransformer

# Load the lightweight model (approx 80MB)
model = SentenceTransformer('all-MiniLM-L6-v2')

def chunk_text(chunks: list, max_tokens=300) -> list:
    result, current, current_chars = [], [], 0
    max_chars = max_tokens * 4
    for c in chunks:
        chars = len(c['content'])
        if current_chars + chars > max_chars and current:
            result.append({
                'content': ' '.join(x['content'] for x in current),
                'speaker': current[0]['speaker'],
                'timestamp': current[0]['timestamp']
            })
            current, current_chars = [], 0
        current.append(c)
        current_chars += chars
    if current:
        result.append({
            'content': ' '.join(x['content'] for x in current),
            'speaker': current[0]['speaker'],
            'timestamp': current[0]['timestamp']
        })
    return result

def embed_chunks(chunks: list) -> list:
    # 1. Extract the text from each chunk
    texts = [c['content'] for c in chunks]
    
    # 2. Generate embeddings locally using the CPU
    embeddings = model.encode(texts)
    
    # 3. Convert numpy arrays to Python lists and attach back to chunks
    for i, emb in enumerate(embeddings):
        chunks[i]['embedding'] = emb.tolist()
        
    return chunks

def embed_query(text: str) -> list:
    # Generate embedding for a single search string
    embedding = model.encode([text])[0]
    return embedding.tolist()