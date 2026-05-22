import math
import urllib.request
import json
from datetime import datetime
from typing import List, Tuple, Optional
from sqlalchemy.orm import Session
import models
import os
import google.generativeai as genai
import time

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

CACHE = {}

def get_from_cache(key: str) -> Optional[any]:
    if key in CACHE:
        val, expiry = CACHE[key]
        if time.time() < expiry:
            return val
        else:
            del CACHE[key]
    return None

def set_in_cache(key: str, value: any, ttl_seconds: int = 300):
    CACHE[key] = (value, time.time() + ttl_seconds)

def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Great-circle distance in km."""
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lng2 - lng1)
    a = math.sin(delta_phi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

def generate_ai_route_explanation(
    shortest_totals: dict, 
    safest_totals: dict, 
    safest_score: float, 
    shortest_score: float, 
    duration_diff: float,
    context: dict = None
) -> Optional[str]:
    """Generates AI explanation comparing routes."""
    cache_key = f"explanation_{safest_score}_{shortest_score}_{duration_diff}_{json.dumps(shortest_totals, sort_keys=True)}_{json.dumps(safest_totals, sort_keys=True)}_{json.dumps(context or {})}"
    cached = get_from_cache(cache_key)
    if cached is not None:
        return cached

    if not GEMINI_API_KEY:
        return None
        
    if safest_score <= shortest_score:
        return None # No need for AI if shortest is safest
        
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        ctx_str = ""
        if context:
            ctx_str = f"""
            Current Time Context: {context.get('time_pattern', 'Normal')}
            Shortest Route High-Risk Pockets: {context.get('shortest_pockets', 0)}
            Safest Route High-Risk Pockets: {context.get('safest_pockets', 0)}
            Nearby Safe Places (at destination): {context.get('safe_places_count', 0)} locations (e.g., {', '.join(context.get('safe_places_types', []))})
            """
            
        prompt = f"""
        You are a safety navigation assistant for Sakhi AI. Compare these two routes based on the provided data.
        
        Shortest route incidents: {shortest_totals}
        Safest route incidents: {safest_totals}
        Time difference: The safest route takes {duration_diff} more minutes.
        {ctx_str}
        
        Generate a concise, calm, and informative explanation (max 60 words) of why the user should take the safest route.
        IMPORTANT CONSTRAINTS:
        - Do NOT fabricate incidents or data.
        - Do NOT use panic-inducing language (avoid words like 'dangerous', 'deadly', 'terrifying').
        - Highlight the safe alternatives calmly.
        - Use the time context and density summaries if relevant (e.g., "Given the late night hours...").
        """
        response = model.generate_content(prompt, request_options={"timeout": 5.0})
        
        if response and response.text:
            text = response.text.strip()
            if not text:
                return None
            # Light sanitization
            words = text.split()
            if len(words) > 80:
                text = " ".join(words[:80]) + "..."
            set_in_cache(cache_key, text)
            return text
    except Exception as e:
        print(f"Gemini route explanation error: {e}")
        
    return None

def get_time_multiplier() -> float:
    """Returns a risk multiplier based on current time (High risk at night)."""
    hour = datetime.now().hour
    if 20 <= hour or hour <= 5: # 8 PM to 5 AM
        return 1.5
    return 1.0

def get_recency_multiplier(created_at: datetime) -> float:
    """Returns a multiplier based on report age. Recent = more impact."""
    hours_old = (datetime.utcnow() - created_at).total_seconds() / 3600
    if hours_old <= 24: return 1.0
    if hours_old <= 72: return 0.5
    return 0.25

def get_distance_penalty_multiplier(dist_km: float) -> float:
    """Returns a penalty decay multiplier based on distance (m) from route coordinate."""
    dist_m = dist_km * 1000.0
    if dist_m <= 50.0:
        return 1.0
    elif dist_m <= 100.0:
        return 0.7
    elif dist_m <= 200.0:
        return 0.4
    elif dist_m <= 1000.0:
        return 0.1
    elif dist_m <= 2000.0:
        return 0.02
    return 0.0

def fetch_osrm_routes(start: Tuple[float, float], end: Tuple[float, float]) -> List[dict]:
    """
    Fetches driving routes from the public OSRM API.
    Coordinates parameter: start coordinate, end coordinate.
    Note: OSRM expects longitude,latitude format.
    """
    url = f"https://router.project-osrm.org/route/v1/driving/{start[1]},{start[0]};{end[1]},{end[0]}?overview=full&geometries=geojson&alternatives=true"
    try:
        req = urllib.request.Request(
            url, 
            headers={'User-Agent': 'Sakhi-AI-Safety-Routing'}
        )
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())
            if data.get("code") == "Ok":
                return data.get("routes", [])
    except Exception as e:
        print(f"Error fetching route from OSRM: {e}")
    return []

def cluster_unsafe_points(unsafe_points: List[dict]) -> List[dict]:
    """
    Groups unsafe coordinates (where safety score < 50) within 150m (0.15 km) of each other.
    Each cluster returns:
      - lat, lng (centroid)
      - score (average score of cluster)
      - incident_types (incident categories present nearby)
    """
    clusters = []
    for pt in unsafe_points:
        lat, lng = pt["pos"]
        score = pt["score"]
        incidents = pt["incidents"]
        
        added = False
        for c in clusters:
            dist = haversine_distance(lat, lng, c["centroid_lat"], c["centroid_lng"])
            if dist <= 0.15: # 150 meters
                c["points"].append(pt)
                # Recompute centroid & average score
                pts = c["points"]
                c["centroid_lat"] = sum(p["pos"][0] for p in pts) / len(pts)
                c["centroid_lng"] = sum(p["pos"][1] for p in pts) / len(pts)
                c["average_score"] = sum(p["score"] for p in pts) / len(pts)
                for inc in incidents:
                    if inc not in c["incident_types"]:
                        c["incident_types"].append(inc)
                added = True
                break
                
        if not added:
            clusters.append({
                "centroid_lat": lat,
                "centroid_lng": lng,
                "average_score": score,
                "incident_types": list(incidents),
                "points": [pt]
            })
            
    formatted_zones = []
    for c in clusters:
        formatted_zones.append({
            "lat": round(c["centroid_lat"], 5),
            "lng": round(c["centroid_lng"], 5),
            "score": round(c["average_score"], 1),
            "incident_types": c["incident_types"]
        })
    return formatted_zones

def calculate_safety_score(lat: float, lng: float, db: Session, preferences: Optional[List[str]] = None, reports: Optional[List[models.Report]] = None) -> dict:
    """Enhanced safety score based on incidents, time, and recency with bounding box optimization."""
    if reports is None:
        # Fallback bounding box filter for 2km radius
        lat_delta = 2.0 / 111.0
        lng_delta = 2.0 / (111.0 * math.cos(math.radians(lat))) if math.cos(math.radians(lat)) > 0 else 2.0 / 111.0
        reports = db.query(models.Report).filter(
            models.Report.latitude.between(lat - lat_delta, lat + lat_delta),
            models.Report.longitude.between(lng - lng_delta, lng + lng_delta)
        ).all()
        
    score = 100
    penalties = {"harassment": 20, "unsafe_area": 15, "poor_lighting": 10}
    breakdown = {"harassment": 0, "unsafe_area": 0, "poor_lighting": 0}
    time_mult = get_time_multiplier()
    
    if preferences:
        for pref in preferences:
            if pref in penalties: 
                penalties[pref] *= 2

    for report in reports:
        dist = haversine_distance(lat, lng, report.latitude, report.longitude)
        if dist <= 2.0:
            rtype = report.type
            if rtype in breakdown: 
                breakdown[rtype] += 1
            
            # Apply multipliers
            recency_mult = get_recency_multiplier(report.created_at)
            dist_mult = get_distance_penalty_multiplier(dist)
            deduction = penalties.get(rtype, 5) * time_mult * recency_mult * dist_mult
            score -= deduction
            
    score = max(0.0, min(100.0, round(score, 1)))
    
    if score >= 80: risk_level = "safe"
    elif score >= 50: risk_level = "medium"
    else: risk_level = "unsafe"
        
    return {"score": score, "risk_level": risk_level, "breakdown": breakdown}

def get_nearby_safe_places(lat: float, lng: float, db: Session, radius: float = 2.0) -> List[dict]:
    """Finds and ranks nearby safe places by distance and type priority."""
    places = db.query(models.SafePlace).all()
    nearby = []
    
    type_priority = {"police": 1, "hospital": 2, "metro": 3, "pharmacy": 4, "landmark": 5}
    
    for p in places:
        dist = haversine_distance(lat, lng, p.latitude, p.longitude)
        if dist <= radius:
            nearby.append({
                "id": p.id,
                "name": p.name,
                "type": p.type,
                "distance": round(dist, 2),
                "latitude": p.latitude,
                "longitude": p.longitude,
                "address": p.address,
                "phone": p.phone,
                "priority": type_priority.get(p.type, 10)
            })
    
    nearby.sort(key=lambda x: (x["priority"], x["distance"]))
    return nearby

def check_behavior_risk(lat: float, lng: float, history: List[dict]) -> dict:
    """Analyzes movement patterns for safety signals."""
    if len(history) < 3:
        return {"risk_signal": "normal", "reason": "Insufficient data"}
    
    is_stationary = True
    first_pos = history[0]
    for pos in history[1:3]:
        dist = haversine_distance(first_pos["lat"], first_pos["lng"], pos["lat"], pos["lng"])
        if dist > 0.01: # 10 meters move
            is_stationary = False
            break
            
    if is_stationary:
        return {"risk_signal": "alert", "reason": "User stationary in one location for extended period"}
        
    return {"risk_signal": "normal", "reason": "Normal movement pattern"}

def evaluate_route_safety(points: List[Tuple[float, float]], db: Session, preferences: Optional[List[str]] = None) -> dict:
    """
    Evaluates safety parameters for a list of coordinates (designed to score direct OSRM paths).
    """
    if len(points) < 2:
        return {
            "average_score": 100,
            "worst_score": 100,
            "weighted_score": 100,
            "unsafe_segments": [],
            "incident_totals": {"harassment": 0, "poor_lighting": 0, "unsafe_area": 0}
        }
        
    # Spatial Optimization: Pre-fetch all reports in route's bounding box
    min_lat = min(p[0] for p in points) - (2.0 / 111.0)
    max_lat = max(p[0] for p in points) + (2.0 / 111.0)
    
    avg_lat = (min_lat + max_lat) / 2.0
    lng_scale = math.cos(math.radians(avg_lat))
    lng_delta = 2.0 / (111.0 * lng_scale) if lng_scale > 0 else 2.0 / 111.0
    
    min_lng = min(p[1] for p in points) - lng_delta
    max_lng = max(p[1] for p in points) + lng_delta
    
    route_reports = db.query(models.Report).filter(
        models.Report.latitude.between(min_lat, max_lat),
        models.Report.longitude.between(min_lng, max_lng)
    ).all()
    
    # Dynamic Sampling: Sample points based on total coordinate count
    total_coords = len(points)
    # Estimate distance of route in meters
    total_dist_km = sum(haversine_distance(points[i-1][0], points[i-1][1], points[i][0], points[i][1]) for i in range(1, len(points)))
    distance_meters = total_dist_km * 1000.0
    
    num_samples = max(5, min(100, int(distance_meters / 100)))
    
    sampled_points = []
    if total_coords <= num_samples:
        sampled_points = points
    else:
        for idx in range(num_samples):
            coord_idx = int(idx * (total_coords - 1) / (num_samples - 1))
            sampled_points.append(points[coord_idx])
            
    scores = []
    unsafe_points = []
    incident_totals = {"harassment": 0, "poor_lighting": 0, "unsafe_area": 0}
    
    for lat, lng in sampled_points:
        pt_data = calculate_safety_score(lat, lng, db, preferences, route_reports)
        score = pt_data["score"]
        scores.append(score)
        
        # Accumulate incidents
        for k, v in pt_data["breakdown"].items():
            if k in incident_totals:
                incident_totals[k] += v
                
        if score < 50:
            active_incidents = {k for k, v in pt_data["breakdown"].items() if v > 0}
            unsafe_points.append({
                "pos": [lat, lng],
                "score": score,
                "incidents": active_incidents
            })
            
    avg_score = sum(scores) / len(scores) if scores else 100.0
    worst_score = min(scores) if scores else 100.0
    
    # Weighted route score
    weighted_score = (avg_score * 0.7) + (worst_score * 0.3)
    # Heavily penalize routes where worst_score < 30
    if worst_score < 30:
        weighted_score = max(5.0, weighted_score - 40.0)
        
    return {
        "average_score": round(avg_score, 1),
        "worst_score": round(worst_score, 1),
        "weighted_score": round(weighted_score, 1),
        "unsafe_segments": cluster_unsafe_points(unsafe_points),
        "incident_totals": incident_totals
    }

