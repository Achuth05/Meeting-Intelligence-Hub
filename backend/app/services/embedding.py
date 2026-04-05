import os
import requests
import time

# Configuration for Hugging Face Inference API
# Get your free token from: https://huggingface.co/settings/tokens
HF_TOKEN = os.environ.get("HF_API_TOKEN")
MODEL_ID = "sentence-transformers/all-MiniLM-L6-v2"
API_URL = f"https://api-inference.huggingface.co/pipeline/feature-extraction/{MODEL_ID}"
headers = {"Authorization": f"Bearer {HF_TOKEN}"}

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

def query_huggingface(payload):
    """Handles the API call with a retry logic if the model is loading."""
    response = requests.post(API_URL, headers=headers, json=payload)
    
    # 503 means the model is still loading on Hugging Face's servers
    if response.status_code == 503:
        estimated_time = response.json().get('estimated_time', 5)
        print(f"Model is loading... waiting {estimated_time}s")
        time.sleep(estimated_time)
        response = requests.post(API_URL, headers=headers, json=payload)
        
    if response.status_code != 200:
        raise Exception(f"Hugging Face API Error: {response.text}")
        
    return response.json()

def embed_chunks(chunks: list) -> list:
    if not chunks:
        return []

    texts = [c['content'] for c in chunks]

    payload = {
        "inputs": texts,
        "options": {"wait_for_model": True}
    }

    embeddings = query_huggingface(payload)

    for i, emb in enumerate(embeddings):
        chunks[i]['embedding'] = emb

    return chunks

def embed_query(text: str) -> list:
    payload = {
        "inputs": text,  # single string, not list
        "options": {"wait_for_model": True}
    }
    response = query_huggingface(payload)
        # response will be a list of lists, take first
    if isinstance(response[0], list):
        return response[0]
    return response