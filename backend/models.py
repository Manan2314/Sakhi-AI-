from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    username = Column(String, unique=True, index=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    preferences = Column(JSON, default=[]) # List of safe concerns: ["harassment", "poor_lighting"]
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    contacts = relationship("EmergencyContact", back_populates="owner")
    reports = relationship("Report", back_populates="creator")
    sessions = relationship("GuardianSession", back_populates="user")

class EmergencyContact(Base):
    __tablename__ = "emergency_contacts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    phone = Column(String)

    owner = relationship("User", back_populates="contacts")

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Maker of the report
    type = Column(String) # harassment, unsafe_area, poor_lighting
    latitude = Column(Float)
    longitude = Column(Float)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    creator = relationship("User", back_populates="reports")

class SafePlace(Base):
    __tablename__ = "safe_places"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    type = Column(String) # police, hospital, metro, pharmacy, landmark
    latitude = Column(Float)
    longitude = Column(Float)
    address = Column(String)
    phone = Column(String, nullable=True)

class GuardianSession(Base):
    __tablename__ = "guardian_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    is_active = Column(Boolean, default=True)
    last_latitude = Column(Float)
    last_longitude = Column(Float)
    started_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="sessions")
