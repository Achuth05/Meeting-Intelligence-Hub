from sentence_transformers import SentenceTransformer
import tiktoken

model = SentenceTransformer("all-MiniLM-L6-v2")
enc = tiktoken.encoding_for_model("text-embedding-3-small")

def chunk_text(chunks: list, max_tokens=300) -> list:
    """Merge small chunks into ~300-token windows for better context. Don't merge different speakers."""
    result, current, current_tokens = [], [], 0
    for c in chunks:
        tokens = len(enc.encode(c['content']))
        # If adding this chunk would exceed limit, or it's from a different speaker, flush current
        if (current_tokens + tokens > max_tokens or (current and c['speaker'] != current[0]['speaker'])) and current:
            result.append({
                'content': ' '.join(x['content'] for x in current),
                'speaker': current[0]['speaker'],
                'timestamp': current[0]['timestamp']
            })
            current, current_tokens = [], 0
        current.append(c)
        current_tokens += tokens
    if current:
        result.append({
            'content': ' '.join(x['content'] for x in current),
            'speaker': current[0]['speaker'],
            'timestamp': current[0]['timestamp']
        })
    return result

def embed_chunks(chunks: list) -> list:
    """Returns chunks with embedding field added. Uses local embeddings."""
    texts = [c['content'] for c in chunks]
    embeddings = model.encode(texts, convert_to_tensor=False)
    for i, emb in enumerate(embeddings):
        chunks[i]['embedding'] = emb.tolist()
    return chunks