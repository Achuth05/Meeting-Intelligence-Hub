from fastembed import TextEmbedding

model = TextEmbedding("BAAI/bge-small-en-v1.5")  # 384 dims, CPU only, tiny

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
    embeddings = list(model.embed(texts))
    for i, emb in enumerate(embeddings):
        chunks[i]['embedding'] = emb.tolist()
    return chunks