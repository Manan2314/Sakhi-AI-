from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
import models
import google.generativeai as genai
import os
import math

router = APIRouter(tags=["Area Insights"])

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lng2 - lng1)
    a = math.sin(delta_phi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

@router.get("/area-insights")
async def get_area_insights(
    lat: float = Query(...),
    lng: float = Query(...),
    radius: float = Query(2.0),
    db: Session = Depends(get_db)
):
    # Fallback static query
    reports = db.query(models.Report).all()
    nearby_reports = [r for r in reports if haversine_distance(lat, lng, r.latitude, r.longitude) <= radius]
    
    if not nearby_reports:
        return {"briefing": "No recent community reports in this area. Conditions appear relatively clear, but always stay aware of your surroundings."}
        
    incident_counts = {}
    for r in nearby_reports:
        incident_counts[r.type] = incident_counts.get(r.type, 0) + 1
        
    if not GEMINI_API_KEY:
        cats = ", ".join([f"{v} {k.replace('_', ' ')}" for k, v in incident_counts.items()])
        return {"briefing": f"Based on historical data, recent reports in this area include: {cats}. Please remain cautious."}
        
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        hour_counts = {}
        for r in nearby_reports:
            if hasattr(r, 'created_at') and r.created_at:
                try:
                    if isinstance(r.created_at, str):
                        hour = int(r.created_at[11:13])
                    else:
                        hour = r.created_at.hour
                    hour_counts[hour] = hour_counts.get(hour, 0) + 1
                except:
                    pass
        peak_hours_str = "Unknown"
        if hour_counts:
            peak_hour = max(hour_counts, key=hour_counts.get)
            peak_hours_str = f"{peak_hour}:00 - {peak_hour+1}:00"
            
        total_reports = len(nearby_reports)

        prompt = f"""
        You are a safety navigation assistant providing a neighborhood safety briefing.
        Recent community reports in this area: {incident_counts}.
        Total reports: {total_reports}.
        Peak reporting hours: {peak_hours_str}.
        
        Generate a short neighborhood safety briefing (max 80 words) summarizing these reports.
        Tone: calm, supportive, informational, assistive.
        Strict Rules:
        - Do NOT use fear-based language or panic-inducing wording.
        - Do NOT make predictive crime forecasting or assume future events.
        - Do NOT label areas as inherently dangerous.
        - ONLY use the provided report counts and hours.
        """
        response = model.generate_content(prompt, request_options={"timeout": 5.0})
        
        if response and response.text:
            text = response.text.strip()
            if not text:
                raise ValueError("Empty response")
            return {"briefing": text}
    except Exception as e:
        print(f"Gemini error in area-insights: {e}")
        
    # Fallback
    cats = ", ".join([f"{v} {k.replace('_', ' ')}" for k, v in incident_counts.items()])
    return {"briefing": f"Recent reports in this area include: {cats}. Please remain cautious."}
