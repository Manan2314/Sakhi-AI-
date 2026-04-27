# Sakhi AI - Safety Intelligence Platform

Sakhi AI is a full-stack, data-driven safety intelligence platform designed to empower women with real-time safety insights, community reports, and intelligent navigation.

## 🌟 Key Features

### 1. Live Safety Scoring
- **Environment-Aware**: High-accuracy safety scores calculated based on current location.
- **Dynamic Weighting**: Scores account for incident density, report recency (older reports decay), and time of day (1.5x risk multiplier at night).
- **Personalized Logic**: Users can specify safety concerns (e.g., "harassment") to double the penalty for specific incident types.

### 2. Guardian Mode (Live Tracking)
- **Session Management**: Initiate active safety sessions that persist in the backend.
- **Behavior Analysis**: Intelligent pattern matching detects if a user is stationary for too long or in a known danger zone.
- **Emergency Sync**: Automatically links active sessions to stored emergency contacts.

### 3. Intelligent Safe-Routing
- **Segmented Path Analysis**: Evaluates every step of a journey.
- **Visual Risk Zones**: Highlights route segments in **Green (Safe)**, **Orange (Moderate)**, and **Red (High Risk)**.
- **Detailed Recommendations**: Provides actionable advice (e.g., "Deeply unsafe areas detected—consider alternative").

### 4. Safety Intelligence Map
- **Live Filtering**: Query parameters allow users to toggle layers for specific incident types (Harassment, Poor Lighting, Unsafe Areas).
- **Public Safety Overlay**: Real-time visualization of Police Stations, Hospitals, and Metro Stations ranked by proximity and priority.

### 5. Instant SOS Trigger
- **One-Tap Emergency**: Notifies guardians and services immediately.
- **Survivor Support**: Instantly identifies the Top 3 nearest safe havens (Hospitals/Police) for immediate relocation.

## 🏗️ Architecture

- **Frontend**: React + Vite + TailwindCSS + Leaflet.js
- **Backend**: FastAPI (Python) + SQLAlchemy ORM
- **Database**: SQLite (SQLAlchemy)
- **Logic**: Haversine distance, time-series report weighting, and behavior pattern matching.

## 🚀 Getting Started

### 1. Backend Setup
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt

# Seed the database with Delhi safety data
python scripts/seed_data.py

# Start server
uvicorn main:app --reload
```

### 2. Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```

## 📡 API Overview

| Endpoint | Method | Params | Description |
| :--- | :--- | :--- | :--- |
| `/safety-score` | GET | `lat, lng, preferences` | Comprehensive safety score + breakdown. |
| `/safe-route` | GET | `points, preferences` | Analyzes a full path for risk segments. |
| `/safe-places` | GET | `lat, lng` | Nearest hospitals, police, & metro stations. |
| `/guardian/start` | POST | `user_id, lat, lng` | Starts an active safety session. |
| `/trigger-unsafe` | POST | `lat, lng` | Triggers emergency alerts & safe-haven search. |
| `/reports` | GET | `type` | Fetches filtered community reports. |

---
*Built for real-world safety impact.*
