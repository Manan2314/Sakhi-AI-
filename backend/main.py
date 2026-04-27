from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from database import engine, Base, get_db
import models
from api.safety import router as safety_router
from api.guardian import router as guardian_router
from api.users import router as users_router

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Sakhi AI Backend",
    description="Safety Intelligence Platform API",
    version="0.1.0"
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(safety_router)
app.include_router(guardian_router)
app.include_router(users_router)



# --- Pydantic Schemas ---
class ReportBase(BaseModel):
    type: str
    latitude: float
    longitude: float
    description: Optional[str] = None

class ReportCreate(ReportBase):
    pass

class Report(ReportBase):
    id: int
    created_at: str # Simplification for retrieval

    class Config:
        from_attributes = True

# --- API Endpoints ---

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/reports")
async def create_report(report: ReportCreate, db: Session = Depends(get_db)):
    """
    Create a new community safety report.
    """
    db_report = models.Report(
        type=report.type,
        latitude=report.latitude,
        longitude=report.longitude,
        description=report.description
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return {"status": "success", "message": "Report saved", "id": db_report.id}

@app.get("/reports")
async def get_reports(
    type: Optional[str] = Query(None, description="Filter by report type"),
    db: Session = Depends(get_db)
):
    """
    Retrieve community safety reports, with optional type filtering.
    """
    query = db.query(models.Report)
    if type:
        query = query.filter(models.Report.type == type)
    
    reports = query.all()
    return reports

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
