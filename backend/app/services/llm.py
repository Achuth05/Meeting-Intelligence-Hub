from groq import Groq
import json
import re

client = Groq()

# ─── Extraction ────────────────────────────────────────────────────────────────

EXTRACT_PROMPT = """You are a meeting analysis expert. Carefully read the transcript below and extract ALL decisions and action items.

IMPORTANT: The transcript format is "Speaker Name: content". 
- Extract the ACTUAL speaker name (not "Speaker" placeholder).
- DECISIONS: Conclusions reached, agreements made, or plans decided upon.
- ACTION ITEMS: Tasks someone needs to do. 
- OWNER: Identify the specific person responsible. This might be the speaker OR someone mentioned in the sentence (e.g., if Alice says "Bob will do X", the owner is Bob).
- DUE DATE: Convert dates like "April 10th" to a YYYY-MM-DD format. 

CONTEXT HINT: The meeting occurred in the year {year_hint}. Base all relative dates on this year.

Return ONLY this JSON format (no other text):
{{
  "decisions": [
    {{"description": "Complete decision text", "context": "Who said it or context"}}
  ],
  "action_items": [
    {{"description": "Complete task description", "owner": "Actual person name", "due_date": "YYYY-MM-DD or null"}}
  ]
}}

TRANSCRIPT:
{transcript}

Now return the JSON:"""

def extract_actions(transcript_text: str, meeting_date: str = None) -> dict:
    text = transcript_text[:12000]
    year_hint = meeting_date[:4] if (meeting_date and len(meeting_date) >= 4) else "2026"

    try:
        resp = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": EXTRACT_PROMPT.format(transcript=text, year_hint=year_hint)}],
            temperature=0.1
        )
        resp_text = resp.choices[0].message.content.strip()
        resp_text = re.sub(r'```json\s*', '', resp_text)
        resp_text = re.sub(r'```\s*', '', resp_text)
        resp_text = resp_text.strip()

        json_match = re.search(r'\{[\s\S]*\}', resp_text)
        if json_match:
            resp_text = json_match.group()
        else:
            return {"decisions": [], "action_items": []}

        result = json.loads(resp_text)
        if 'decisions' not in result: result['decisions'] = []
        if 'action_items' not in result: result['action_items'] = []
        return result

    except json.JSONDecodeError:
        return {"decisions": [], "action_items": []}
    except Exception as e:
        print(f"DEBUG: Groq API error: {e}")
        return {"decisions": [], "action_items": []}


# ─── Sentiment ─────────────────────────────────────────────────────────────────

SENTIMENT_PROMPT = """Analyze the sentiment of this meeting transcript in detail.
Return ONLY valid JSON with this exact structure, no other text:

{{
  "overall_score": 0.3,
  "label": "Positive",
  "highlights": ["reason 1", "reason 2"],
  "speaker_breakdown": {{
    "Alice": {{"score": 0.8, "label": "Positive", "dominant_emotion": "enthusiasm"}},
    "Bob": {{"score": -0.2, "label": "Negative", "dominant_emotion": "frustration"}}
  }},
  "segments": [
    {{
      "speaker": "Alice",
      "text": "brief excerpt max 20 words",
      "score": 0.7,
      "label": "consensus",
      "emotion": "enthusiasm"
    }}
  ]
}}

Labels for overall and speaker: Positive, Neutral, Negative
Labels for segments: consensus, conflict, frustration, enthusiasm, uncertainty, neutral

TRANSCRIPT:
{transcript}"""

def analyze_sentiment(transcript_text: str) -> dict:
    text = transcript_text[:6000]
    try:
        resp = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": SENTIMENT_PROMPT.format(transcript=text)}],
            response_format={"type": "json_object"},
            temperature=0.1
        )
        data = json.loads(resp.choices[0].message.content)
        if 'overall_score' not in data: data['overall_score'] = 0
        if 'label' not in data: data['label'] = 'Neutral'
        if 'highlights' not in data: data['highlights'] = []
        if 'speaker_breakdown' not in data: data['speaker_breakdown'] = {}
        if 'segments' not in data: data['segments'] = []
        return data
    except Exception as e:
        print(f"DEBUG: Sentiment error: {e}")
        return {"overall_score": 0, "label": "Neutral", "highlights": [], "speaker_breakdown": {}, "segments": []}