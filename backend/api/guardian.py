from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from database import get_db
import models
from datetime import datetime
from services.safety import check_behavior_risk

router = APIRouter(tags=["Guardian Mode"])

@router.post("/guardian/start")
async def start_guardian(user_id: int, lat: float, lng: float, db: Session = Depends(get_db)):
    """Starts a new guardian session."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Close any existing active sessions
    db.query(models.GuardianSession).filter(
        models.GuardianSession.user_id == user_id, 
        models.GuardianSession.is_active == True
    ).update({"is_active": False})
    
    session = models.GuardianSession(
        user_id=user_id,
        last_latitude=lat,
        last_longitude=lng,
        is_active=True
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    
    # Fetch contacts from the dedicated table
    contacts = db.query(models.EmergencyContact).filter(models.EmergencyContact.user_id == user_id).all()
    
    return {
        "status": "guardian_active", 
        "session_id": session.id, 
        "emergency_contacts": [{"name": c.name, "phone": c.phone} for c in contacts]
    }

@router.post("/guardian/update")
async def update_location(
    session_id: int, 
    lat: float, 
    lng: float, 
    history: list = Body([]), 
    db: Session = Depends(get_db)
):
    """Updates location and checks for behavior-based risks."""
    session = db.query(models.GuardianSession).filter(
        models.GuardianSession.id == session_id,
        models.GuardianSession.is_active == True
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Active session not found")
        
    session.last_latitude = lat
    session.last_longitude = lng
    session.updated_at = datetime.utcnow()
    
    # Simple behavior check
    behavior = check_behavior_risk(lat, lng, history)
    
    db.commit()
    return {
        "status": "updated", 
        "behavior_analysis": behavior,
        "is_alert_triggered": behavior["risk_signal"] == "alert"
    }

@router.post("/guardian/stop")
async def stop_guardian(session_id: int, db: Session = Depends(get_db)):
    """Stops the guardian session."""
    session = db.query(models.GuardianSession).filter(models.GuardianSession.id == session_id).first()
    if session:
        session.is_active = False
        db.commit()
    return {"status": "guardian_inactive"}
