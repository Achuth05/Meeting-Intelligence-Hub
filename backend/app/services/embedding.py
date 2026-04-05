from openai import OpenAI
import os

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

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
    texts = [c['content'] for c in chunks]
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=texts
    )
    for i, emb in enumerate(response.data):
        chunks[i]['embedding'] = emb.embedding
    return chunks

def embed_query(text: str) -> list:
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=[text]
    )
    return response.data[0].embedding