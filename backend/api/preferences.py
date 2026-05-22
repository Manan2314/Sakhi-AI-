from fastapi import APIRouter, Body
from services.safety import get_from_cache, set_in_cache
from typing import Dict
import google.generativeai as genai
import os
import json
import re

router = APIRouter(tags=["AI Preferences"])

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

ALLOWED_PREFS = {
    "poor_lighting",
    "harassment",
    "unsafe_area",
    "isolated_areas",
    "crowded_roads_preferred",
    "public_transport_nearby"
}

@router.post("/extract-preferences")
async def extract_preferences(payload: Dict[str, str] = Body(...)):
    text = payload.get("text", "")
    if not text.strip() or not GEMINI_API_KEY:
        return {"preferences": []}
        
    cache_key = f"prefs_{text}"
    cached = get_from_cache(cache_key)
    if cached is not None:
        return {"preferences": cached}
        
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = f"""
        Extract safety preferences from the following user text.
        You must ONLY output a strict JSON object with a single key "preferences" containing a list of strings.
        Do NOT output explanations. Do NOT use markdown formatting (no ```json). Do NOT include any extra keys.
        
        Only use the following allowed categories:
        {list(ALLOWED_PREFS)}
        
        Text: "{text}"
        """
        response = model.generate_content(prompt, request_options={"timeout": 5.0})
        
        if response and response.text:
            output = response.text.strip()
            output = re.sub(r'^```json', '', output)
            output = re.sub(r'```$', '', output).strip()
            
            try:
                parsed = json.loads(output)
                if isinstance(parsed, dict) and "preferences" in parsed:
                    valid_prefs = [p for p in parsed["preferences"] if p in ALLOWED_PREFS]
                    set_in_cache(cache_key, valid_prefs)
                    return {"preferences": valid_prefs}
                elif isinstance(parsed, list):
                    valid_prefs = [p for p in parsed if p in ALLOWED_PREFS]
                    set_in_cache(cache_key, valid_prefs)
                    return {"preferences": valid_prefs}
            except json.JSONDecodeError:
                pass
    except Exception as e:
        print(f"Gemini pref extraction error: {e}")
        
    return {"preferences": []}
