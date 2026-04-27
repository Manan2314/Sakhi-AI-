from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from database import get_db
import models
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter(tags=["User System"])

class UserCreate(BaseModel):
    name: str
    username: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    preferences: List[str] = []

class ContactCreate(BaseModel):
    name: str
    phone: str

@router.post("/user")
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # Derive username from phone or name if not provided
    effective_username = user.username or user.phone or f"{user.name.lower().replace(' ', '_')}_{int(datetime.utcnow().timestamp())}"
    
    db_user = db.query(models.User).filter(models.User.username == effective_username).first()
    if db_user:
        return db_user # Simple auto-login for MVP
    
    new_user = models.User(
        name=user.name,
        username=effective_username,
        phone=user.phone,
        email=user.email,
        preferences=user.preferences
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.get("/user/{user_id}")
async def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/user/{user_id}/preferences")
async def update_preferences(user_id: int, preferences: List[str] = Body(...), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.preferences = preferences
    db.commit()
    return {"status": "updated", "preferences": user.preferences}

@router.post("/user/{user_id}/contacts")
async def add_contact(user_id: int, contact: ContactCreate, db: Session = Depends(get_db)):
    new_contact = models.EmergencyContact(
        user_id=user_id,
        name=contact.name,
        phone=contact.phone
    )
    db.add(new_contact)
    db.commit()
    db.refresh(new_contact)
    return new_contact

@router.get("/user/{user_id}/contacts")
async def list_contacts(user_id: int, db: Session = Depends(get_db)):
    return db.query(models.EmergencyContact).filter(models.EmergencyContact.user_id == user_id).all()
