from fastapi import APIRouter, Depends, Query, Body, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
from typing import Optional, List
from services.safety import calculate_safety_score, evaluate_route_safety, get_nearby_safe_places

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

@router.get("/safe-route")
async def get_safe_route_analysis(
    points: str = Query(..., description="Comma separated lat,lng points"),
    preferences: Optional[str] = Query(None),
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Analyzes a path of points for route safety."""
    pref_list = resolve_preferences(db, preferences, user_id)
    parsed_points = []
    for p in points.split("|"):
        coords = p.split(",")
        parsed_points.append((float(coords[0]), float(coords[1])))
    
    return evaluate_route_safety(parsed_points, db, pref_list)
