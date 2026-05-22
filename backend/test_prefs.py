from dotenv import load_dotenv
load_dotenv() # Load from backend/.env BEFORE importing

import asyncio
import time
from api.preferences import extract_preferences
import os

async def test():
    req = {"text": "I dislike isolated roads and dark streets"}
    
    start1 = time.time()
    res1 = await extract_preferences(req)
    end1 = time.time()
    
    start2 = time.time()
    res2 = await extract_preferences(req)
    end2 = time.time()
    
    print(f"Call 1 ({end1-start1:.4f}s):", res1)
    print(f"Call 2 ({end2-start2:.4f}s):", res2)

asyncio.run(test())
