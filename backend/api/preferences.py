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
    if not text.strip():
        return {"preferences": []}
        
    if not GEMINI_API_KEY:
        # Dummy fallback for local testing without API key
        dummy_prefs = []
        lower_text = text.lower()
        if "dark" in lower_text or "light" in lower_text: dummy_prefs.append("poor_lighting")
        if "harass" in lower_text or "creep" in lower_text or "stare" in lower_text: dummy_prefs.append("harassment")
        if "unsafe" in lower_text or "danger" in lower_text: dummy_prefs.append("unsafe_area")
        if "isolated" in lower_text or "alone" in lower_text or "lonely" in lower_text: dummy_prefs.append("isolated_areas")
        if "crowd" in lower_text or "people" in lower_text: dummy_prefs.append("crowded_roads_preferred")
        if "bus" in lower_text or "metro" in lower_text or "transport" in lower_text: dummy_prefs.append("public_transport_nearby")
        
        # Default to poor_lighting if nothing matched just to show it works
        if not dummy_prefs:
            dummy_prefs.append("poor_lighting")
            
        return {"preferences": dummy_prefs}
        
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
            
            # Robust JSON extraction
            start = output.find('{')
            end = output.rfind('}')
            if start != -1 and end != -1:
                output = output[start:end+1]
            elif output.startswith('[') and output.endswith(']'):
                # In case it returned a list directly
                pass 
                
            try:
                parsed = json.loads(output)
                
                # Helper to normalize preferences
                def normalize(p):
                    return str(p).strip().lower().replace(" ", "_")
                
                extracted = []
                if isinstance(parsed, dict) and "preferences" in parsed:
                    extracted = parsed["preferences"]
                elif isinstance(parsed, list):
                    extracted = parsed
                    
                if extracted:
                    valid_prefs = []
                    for p in extracted:
                        norm_p = normalize(p)
                        if norm_p in ALLOWED_PREFS:
                            valid_prefs.append(norm_p)
                        else:
                            # Fuzzy matching for common cases
                            for allowed in ALLOWED_PREFS:
                                if norm_p in allowed or allowed in norm_p:
                                    valid_prefs.append(allowed)
                                    break
                    
                    # Remove duplicates
                    valid_prefs = list(set(valid_prefs))
                    set_in_cache(cache_key, valid_prefs)
                    return {"preferences": valid_prefs}
            except json.JSONDecodeError as jde:
                print(f"Failed to decode JSON: {output} - Error: {jde}")
                pass
    except Exception as e:
        print(f"Gemini pref extraction error: {e}")
        
    return {"preferences": []}
