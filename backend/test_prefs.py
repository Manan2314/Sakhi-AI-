import google.generativeai as genai
import os
import json
import re

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash')

text = "It is too dark and isolated"
prompt = f"""
Extract safety preferences from the following user text.
You must ONLY output a strict JSON object with a single key "preferences" containing a list of strings.
Do NOT output explanations. Do NOT use markdown formatting (no ```json). Do NOT include any extra keys.

Only use the following allowed categories:
['poor_lighting', 'harassment', 'unsafe_area', 'isolated_areas', 'crowded_roads_preferred', 'public_transport_nearby']

Text: "{text}"
"""
response = model.generate_content(prompt, request_options={"timeout": 5.0})
print("Response text:")
print(response.text)
output = response.text.strip()
output = re.sub(r'^```json', '', output)
output = re.sub(r'```$', '', output).strip()
try:
    parsed = json.loads(output)
    print("Parsed:", parsed)
except Exception as e:
    print("Error:", e)
