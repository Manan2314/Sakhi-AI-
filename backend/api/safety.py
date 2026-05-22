from fastapi import APIRouter, Depends, Query, Body, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
from datetime import datetime
from typing import Optional, List, Tuple
from services.safety import (
    calculate_safety_score, 
    evaluate_route_safety, 
    get_nearby_safe_places,
    fetch_osrm_routes,
    haversine_distance,
    generate_ai_route_explanation
)

router = APIRouter(tags=["Safety Intelligence"])

def resolve_preferences(db: Session, preferences: Optional[str] = None, user_id: Optional[int] = None) -> List[str]:
    """Helper to merge manual query preferences and stored user preferences."""
    all_prefs = []
    if preferences:
        all_prefs.extend([p.strip() for p in preferences.split(",") if p.strip()])
    
    if user_id:
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if user and user.preferences:
            all_prefs.extend(user.preferences)
            
    return list(set(all_prefs)) # Deduplicate

@router.get("/safety-score")
async def get_safety_score(
    lat: float = Query(..., description="Latitude of the location"),
    lng: float = Query(..., description="Longitude of the location"),
    preferences: Optional[str] = Query(None),
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Returns a realistic, environment-aware safety score."""
    pref_list = resolve_preferences(db, preferences, user_id)
    return calculate_safety_score(lat, lng, db, pref_list)

@router.get("/safe-places")
async def get_safe_places(
    lat: float = Query(...),
    lng: float = Query(...),
    radius: float = Query(2.0),
    db: Session = Depends(get_db)
):
    """Finds and ranks nearest hospitals, police stations, and safe zones."""
    return get_nearby_safe_places(lat, lng, db, radius)

@router.post("/trigger-unsafe")
async def trigger_unsafe(
    lat: float = Body(...),
    lng: float = Body(...),
    user_id: Optional[int] = Body(None),
    db: Session = Depends(get_db)
):
    """
    Manual trigger for 'I feel unsafe'. 
    Instantly returns nearest safe places and initiates tracking notifications.
    """
    nearby_safe = get_nearby_safe_places(lat, lng, db, radius=3.0)
    
    contacts = []
    if user_id:
        contacts = db.query(models.EmergencyContact).filter(models.EmergencyContact.user_id == user_id).all()
        
    return {
        "status": "alert_active",
        "message": "Guardian system notified. Head to the nearest safe location.",
        "nearest_safe_places": nearby_safe[:3],
        "notified_contacts": [{"name": c.name, "phone": c.phone} for c in contacts]
    }

def make_explanation(shortest_totals: dict, safest_totals: dict, safest_score: float, shortest_score: float) -> str:
    """Generates comparative natural language description of why safest is chosen."""
    if safest_score <= shortest_score:
        return "This is the most direct path. No safer alternatives found."
    
    diff_lighting = shortest_totals.get("poor_lighting", 0) - safest_totals.get("poor_lighting", 0)
    diff_harassment = shortest_totals.get("harassment", 0) - safest_totals.get("harassment", 0)
    diff_unsafe = shortest_totals.get("unsafe_area", 0) - safest_totals.get("unsafe_area", 0)
    
    parts = []
    if diff_lighting > 0:
        parts.append(f"{diff_lighting} poorly lit area" + ("s" if diff_lighting > 1 else ""))
    if diff_harassment > 0:
        parts.append(f"{diff_harassment} harassment-prone zone" + ("s" if diff_harassment > 1 else ""))
    if diff_unsafe > 0:
        parts.append(f"{diff_unsafe} unsafe area" + ("s" if diff_unsafe > 1 else ""))
        
    if parts:
        joined_parts = ", ".join(parts[:-1]) + " and " + parts[-1] if len(parts) > 1 else parts[0]
        return f"This route avoids {joined_parts} compared to the shortest path."
    else:
        improvement = round(safest_score - shortest_score, 1)
        return f"This route is safer by {improvement} points compared to the shortest path."

@router.get("/safe-route")
async def get_safe_route_analysis(
    points: str = Query(..., description="Comma separated lat,lng points"),
    preferences: Optional[str] = Query(None),
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Analyzes driving route geometries fetched from OSRM for safety and generates safest alternatives."""
    pref_list = resolve_preferences(db, preferences, user_id)
    
    # Parse points
    parsed_points = []
    for p in points.split("|"):
        coords = p.split(",")
        parsed_points.append((float(coords[0]), float(coords[1])))
        
    if len(parsed_points) < 2:
        raise HTTPException(status_code=400, detail="At least start and end coordinates must be provided.")
        
    start = parsed_points[0]
    end = parsed_points[-1]
    
    # Fetch from OSRM
    osrm_routes = fetch_osrm_routes(start, end)
    
    # OSRM Fallback Handling
    if not osrm_routes:
        raise HTTPException(status_code=503, detail="Routing service temporarily unavailable")
        
    evaluated_routes = []
    
    for idx, route in enumerate(osrm_routes):
        # Convert GeoJSON coordinates from [lng, lat] to [lat, lng]
        coords_lng_lat = route["geometry"]["coordinates"]
        coords_lat_lng = [[c[1], c[0]] for c in coords_lng_lat]
        
        # Evaluate safety metrics
        safety_metrics = evaluate_route_safety(coords_lat_lng, db, pref_list)
        
        evaluated_routes.append({
            "coordinates": coords_lat_lng,
            "distance": round(route.get("distance", 0)), # in meters
            "duration": round(route.get("duration", 0)), # in seconds
            "average_score": safety_metrics["average_score"],
            "worst_score": safety_metrics["worst_score"],
            "weighted_score": safety_metrics["weighted_score"],
            "unsafe_segments": safety_metrics["unsafe_segments"],
            "incident_totals": safety_metrics["incident_totals"]
        })
        
    # Safest Route Selection Logic
    # Shortest is always the primary route from OSRM (first index)
    shortest_route = evaluated_routes[0]
    
    # If OSRM only returned 1 route or all returned routes are identical, and shortest has unsafe segments:
    # Synthesize a safest route that detours around these segments.
    if len(evaluated_routes) == 1 or all(r["coordinates"] == shortest_route["coordinates"] for r in evaluated_routes):
        safest_route = shortest_route
    else:
        # Safest is the route with the highest weighted safety score
        safest_route = max(evaluated_routes, key=lambda r: r["weighted_score"])
    
    # Generate explanations
    shortest_explanation = "This is the most direct path."
    duration_diff = max(0.0, round((safest_route["duration"] - shortest_route["duration"]) / 60, 1))
    
    # Collect Context for AI
    dest_safe_places = get_nearby_safe_places(end[0], end[1], db, radius=3.0)
    safe_places_types = list(set([p["type"].replace("_", " ") for p in dest_safe_places[:5]]))
    
    hour = datetime.now().hour
    if 21 <= hour or hour <= 4: time_pattern = "Late Night"
    elif 17 <= hour <= 20: time_pattern = "Evening Commute"
    else: time_pattern = "Daytime"
    
    context = {
        "time_pattern": time_pattern,
        "shortest_pockets": len(shortest_route["unsafe_segments"]),
        "safest_pockets": len(safest_route["unsafe_segments"]),
        "safe_places_count": len(dest_safe_places),
        "safe_places_types": safe_places_types
    }
    
    ai_explanation = generate_ai_route_explanation(
        shortest_route["incident_totals"],
        safest_route["incident_totals"],
        safest_route["weighted_score"],
        shortest_route["weighted_score"],
        duration_diff,
        context
    )
    
    safest_explanation = ai_explanation if ai_explanation else make_explanation(
        shortest_route["incident_totals"],
        safest_route["incident_totals"],
        safest_route["weighted_score"],
        shortest_route["weighted_score"]
    )
    
    return {
        "routes": [
            {
                "type": "shortest",
                "route_type": "shortest",
                "coordinates": shortest_route["coordinates"],
                "distance": shortest_route["distance"],
                "duration": shortest_route["duration"],
                "average_score": shortest_route["average_score"],
                "worst_score": shortest_route["worst_score"],
                "unsafe_segments": shortest_route["unsafe_segments"],
                "explanation": shortest_explanation
            },
            {
                "type": "safest",
                "route_type": "safest",
                "coordinates": safest_route["coordinates"],
                "distance": safest_route["distance"],
                "duration": safest_route["duration"],
                "average_score": safest_route["average_score"],
                "worst_score": safest_route["worst_score"],
                "unsafe_segments": safest_route["unsafe_segments"],
                "explanation": safest_explanation
            }
        ]
    }

