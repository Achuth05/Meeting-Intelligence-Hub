from openai import OpenAI
import tiktoken

client = OpenAI()
enc = tiktoken.encoding_for_model("text-embedding-3-small")

def chunk_text(chunks: list, max_tokens=300) -> list:
    """Merge small chunks into ~300-token windows for better context."""
    result, current, current_tokens = [], [], 0
    for c in chunks:
        tokens = len(enc.encode(c['content']))
        if current_tokens + tokens > max_tokens and current:
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
    """Returns chunks with embedding field added. Batches requests."""
    texts = [c['content'] for c in chunks]
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=texts
    )
    for i, emb in enumerate(response.data):
        chunks[i]['embedding'] = emb.embedding
    return chunks