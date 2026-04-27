import math
from datetime import datetime
from typing import List, Tuple, Optional
from sqlalchemy.orm import Session
import models

def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Great-circle distance in km."""
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lng2 - lng1)
    a = math.sin(delta_phi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

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

def calculate_safety_score(lat: float, lng: float, db: Session, preferences: Optional[List[str]] = None) -> dict:
    """Enhanced safety score based on incidents, time, and recency."""
    reports = db.query(models.Report).all()
    score = 100
    
    penalties = {"harassment": 20, "unsafe_area": 15, "poor_lighting": 10}
    breakdown = {"harassment": 0, "unsafe_area": 0, "poor_lighting": 0}
    
    time_mult = get_time_multiplier()
    
    if preferences:
        for pref in preferences:
            if pref in penalties: penalties[pref] *= 2

    for report in reports:
        dist = haversine_distance(lat, lng, report.latitude, report.longitude)
        if dist <= 2.0:
            rtype = report.type
            if rtype in breakdown: breakdown[rtype] += 1
            
            # Apply multipliers
            recency_mult = get_recency_multiplier(report.created_at)
            deduction = penalties.get(rtype, 5) * time_mult * recency_mult
            score -= deduction
            
    score = max(0, min(100, round(score, 1)))
    
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
    
    # Sort by priority, then distance
    nearby.sort(key=lambda x: (x["priority"], x["distance"]))
    return nearby

def check_behavior_risk(lat: float, lng: float, history: List[dict]) -> dict:
    """Analyzes movement patterns for safety signals."""
    if len(history) < 3:
        return {"risk_signal": "normal", "reason": "Insufficient data"}
    
    # Check if stationary for too long (e.g., last 3 updates at same spot)
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
    point_results = []
    scores = []
    
    for lat, lng in points:
        point_data = calculate_safety_score(lat, lng, db, preferences)
        scores.append(point_data["score"])
        point_results.append({
            "pos": [lat, lng],
            "score": point_data["score"],
            "risk_level": point_data["risk_level"]
        })
        
    avg_score = sum(scores) / len(scores) if scores else 100
    worst_score = min(scores) if scores else 100
    
    route_risk = "safe" if avg_score >= 80 else "medium" if avg_score >= 50 else "unsafe"
    
    return {
        "average_score": round(avg_score, 1),
        "worst_score": worst_score,
        "route_risk": route_risk,
        "recommendation": "Route is safe" if route_risk == "safe" else "Use caution, some unsafe zones detected",
        "points": point_results
    }
