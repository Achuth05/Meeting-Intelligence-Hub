from groq import Groq
import json
import re

client = Groq()

# Optimized Prompt for Llama 3.3 70B
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
    """Extract decisions and action items using Groq and Llama 3.3 70B."""
    
    # 1. Handle long transcripts (Groq limit safety)
    text = transcript_text[:12000] 
    
    # 2. Set the Year Hint for your 4-file test (2024 vs 2026)
    year_hint = meeting_date[:4] if (meeting_date and len(meeting_date) >= 4) else "2026"
    
    try:
        # 3. Call Groq with high-reasoning model
        resp = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": EXTRACT_PROMPT.format(transcript=text, year_hint=year_hint)}],
            temperature=0.1 # Low temperature ensures strict factual extraction
        )
        
        resp_text = resp.choices[0].message.content.strip()
        
        # 4. Clean Markdown formatting (in case the AI wraps JSON in ```)
        resp_text = re.sub(r'```json\s*', '', resp_text)
        resp_text = re.sub(r'```\s*', '', resp_text)
        resp_text = resp_text.strip()
        
        # 5. Extract JSON structure using Regex safety
        json_match = re.search(r'\{[\s\S]*\}', resp_text)
        if json_match:
            resp_text = json_match.group()
        else:
            print("DEBUG: No JSON structure found in response")
            return {"decisions": [], "action_items": []}
        
        # 6. Parse and Validate
        result = json.loads(resp_text)
        
        # Ensure the frontend doesn't crash on missing keys
        if 'decisions' not in result: result['decisions'] = []
        if 'action_items' not in result: result['action_items'] = []
        
        return result
        
    except json.JSONDecodeError:
        print(f"DEBUG: JSON parse error. Response was: {resp_text[:200]}...")
        return {"decisions": [], "action_items": []}
    except Exception as e:
        print(f"DEBUG: Groq API error: {e}")
        return {"decisions": [], "action_items": []}