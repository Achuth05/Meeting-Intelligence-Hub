from groq import Groq
import json
import re

client = Groq()

EXTRACT_PROMPT = """You are a meeting analysis expert. Carefully read the transcript below and extract ALL decisions and action items.

IMPORTANT: The transcript format is "Speaker Name: content". Extract the ACTUAL speaker name (not "Speaker" placeholder).

DECISIONS: Conclusions reached, agreements made, or plans decided upon.
ACTION ITEMS: Tasks someone needs to do, with who is responsible (the speaker or explicitly mentioned person) and any deadline.

Return ONLY this JSON format (no other text):
{{
  "decisions": [
    {{"description": "Complete decision text", "context": "Who said it or context"}}
  ],
  "action_items": [
    {{"description": "Complete task description", "owner": "Actual person name who is responsible", "due_date": "YYYY-MM-DD or null"}}
  ]
}}

TRANSCRIPT:
{transcript}

Now return the JSON:"""

def extract_actions(transcript_text: str) -> dict:
    """Extract decisions and action items using Groq."""
    text = transcript_text[:12000]  # Truncate for token limits
    
    try:
        resp = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": EXTRACT_PROMPT.format(transcript=text)}],
            temperature=0.1
        )
        
        resp_text = resp.choices[0].message.content.strip()
        print(f"DEBUG: Raw Groq response length: {len(resp_text)}")
        print(f"DEBUG: First 300 chars: {resp_text[:300]}")
        
        # Remove markdown code blocks if present
        resp_text = re.sub(r'```json\s*', '', resp_text)
        resp_text = re.sub(r'```\s*', '', resp_text)
        resp_text = resp_text.strip()
        
        # Extract JSON if wrapped in text
        json_match = re.search(r'\{[\s\S]*\}', resp_text)
        if json_match:
            resp_text = json_match.group()
        
        print(f"DEBUG: Cleaned response: {resp_text[:300]}")
        
        # Parse JSON
        result = json.loads(resp_text)
        
        # Ensure required fields exist
        if 'decisions' not in result:
            result['decisions'] = []
        if 'action_items' not in result:
            result['action_items'] = []
        
        print(f"DEBUG: Successfully parsed: {len(result.get('decisions', []))} decisions, {len(result.get('action_items', []))} actions")
        return result
        
    except json.JSONDecodeError as e:
        print(f"DEBUG: JSON parse error: {e}")
        print(f"DEBUG: Response was: {resp_text[:500]}")
        # Return partial data if parsing fails
        return {"decisions": [], "action_items": []}
    except Exception as e:
        print(f"DEBUG: Groq API error: {e}")
        import traceback
        traceback.print_exc()
        return {"decisions": [], "action_items": []}