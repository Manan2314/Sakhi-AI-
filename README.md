# Sakhi AI — Safety Intelligence for a Secure Tomorrow 🛡️✨

> **"Safety shouldn't be a privilege. It should be an intelligence."**

In a world where safety is often reactive, **Sakhi AI** is a proactive paradigm shift. We don't just tell you where you are; we tell you how safe you'll be before you even step out. Designed specifically for the unique safety landscape of India, Sakhi AI transforms fragmented community data and real-world conditions into actionable safety intelligence.

---

## 🌍 The Vision: Beyond Maps
Sakhi AI is not just another navigation app. It is a **Safety Intelligence System** that bridges the gap between fear and freedom. By analyzing urban conditions, historical incident density, and live community feedback, Sakhi provides a digital companion that watches over you, whether you’re commuting at midnight or exploring a new neighborhood.

---

## 🚨 The Problem Statement
Women’s safety remains a critical challenge, yet most existing solutions are either too slow or too shallow:
- **Reactive, not Proactive**: SOS buttons only work *after* something goes wrong.
- **Data Fragmentation**: Safety data is scattered across news reports, police records, and whispers.
- **Context Blindness**: Standard maps don't account for street lighting, isolated segments, or known harassment zones.
- **Lack of Personalization**: A "safe" route for one person might not feel safe for another depending on the time of day and specific concerns.

---

## 🚀 Latest Updates (Delhi Intelligence & Realism Sprint)
Sakhi AI has been optimized into a showcase-ready platform highlighting hyper-realistic urban safety data in Delhi:
- **Rich Dataset Realism**: The backend dynamically generates believable "micro-clusters" (hotspots) representing real-world urban dangers—nightlife harassment zones, isolated metro exits, and poorly lit residential stretches—while intelligently placing Safe Places like 24/7 pharmacies.
- **Differentiated Route Intelligence**: Thanks to dense hazard clustering, our scoring engine organically forces a clear distinction between the *Shortest Route* (which cuts through high-risk pockets) and the *Safest Route* (which detours around them).
- **Demo Mode Showcase**: Preloaded 1-click Demo Routes (e.g., AIIMS → Saket Metro) allow instant testing of route divergence.
- **Context-Aware AI Insights**: The Gemini AI integration is fed real-time context (time of day, pocket density, nearby safe havens) to generate robust, calm, and highly accurate natural language safety explanations.

---

## 💡 The Solution: Sakhi AI
Sakhi AI turns the tide by making safety **quantifiable and predictable**. We use a proprietary **Safety Scoring Engine** that evaluates urban environments in real-time, helping users make informed decisions *before* a risk manifests.

---

## ✨ Key Features

### 🌡️ Dynamic Safety Scoring
Our core engine calculates high-fidelity safety scores (0-10) using:
- **Spatial Incident Density**: Real-time analysis of nearby reported incidents.
- **Temporal Weighting**: A "Decay Factor" ensures recent reports carry more weight, while older data fades gracefully.
- **Time-of-Day Multiplier**: Risk scores are dynamically adjusted at night (1.5x multiplier) to account for reduced visibility and foot traffic.

### 🛣️ Smart Safe-Routing
Navigation redefined for safety. Sakhi evaluates every segment of your journey:
- **OSRM Integration**: Fetches real road geometries and multiple path alternatives via the open-source OSRM routing engine.
- **Segmented Risk Analysis**: Identifies green (safe), orange (moderate), and red (high-risk) zones along your path. 
- **Context-Aware Routing & Explanations**: Dynamically computes a weighted safety score (averaging the route with severe penalties for worst segments) and generates natural language explanations comparing route incidents (e.g., "This route avoids 2 poorly lit areas").
- **Visual Danger Zones**: Unsafe clusters are highlighted on the map with glowing thermal layers to clearly communicate danger.

### 📢 Community Intelligence
Empowerment through shared data. Users can report incidents (Harassment, Poor Lighting, Stalking) to alert others. This crowdsourced layer creates a living safety map that evolves with the city.

### 🛡️ Guardian Mode & Safe Havens
- **Active Monitoring**: A live "Guardian" session tracks your progress and alerts emergency contacts if you stop moving or enter a danger zone.
- **Survival Support**: One-tap access to the **Top 3 Nearest Safe Havens** (Police Stations, Hospitals, Metro Hubs) with instant navigation.

---

## 🧠 How It Works (Technical Overview)

Sakhi AI is built on a modular, high-performance architecture designed for low-latency safety lookups:

- **Backend (Python/FastAPI)**: The brain of the platform. It handles complex Haversine distance calculations, time-series data weighting, and manages the SQL database via SQLAlchemy.
- **Frontend (React/TypeScript)**: A premium, glassmorphic UI built for speed and clarity. It uses Vite for lightning-fast builds and Leaflet.js for interactive mapping.
- **Scoring Logic**:
  ```python
  Final Score = Base (10) - (Σ IncidentWeights * RecencyFactor * TimeMultiplier)
  ```
- **User Personalization**: Safety preferences (e.g., "Isolated Areas") are injected into the scoring logic to double the penalty for specific risks, making safety truly personal.

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, TailwindCSS 4 |
| **State/Query** | Tanstack Query (React Query), Context API |
| **Maps** | Leaflet.js, React-Leaflet |
| **Backend** | FastAPI (High-performance Python) |
| **Database** | SQLite + SQLAlchemy ORM |
| **Animations** | Framer Motion, Tailwind Animate |

---

## ⚙️ Setup Instructions

### 🐍 Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Seed the database with local safety data:
   ```bash
   python scripts/seed_data.py
   ```
5. Start the engine:
   ```bash
   uvicorn main:app --reload
   ```

### ⚛️ Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## 📸 Demo & Screenshots
*(Add high-resolution screenshots of the Onboarding Flow, Safety Map, and Dashboard here)*

---

## 🚀 Future Scope
- **ML Movement Analysis**: Integrating machine learning to detect unusual gait or running patterns during Guardian sessions.
- **Wearable Integration**: Instant SOS triggers via smartwatches.
- **Gov/NGO Partnerships**: Direct data pipelines to local law enforcement for faster emergency response.
- **Audio Intelligence**: Real-time analysis of ambient noise to detect screams or shouting.

---

## 🤝 The Mission
Sakhi AI is more than a project; it’s a commitment to making our cities walkable and safe for everyone. We believe that **data has the power to protect.**

**Building for impact. Coding for safety.**

---

> **Sakhi AI: Your Companion in Every Step.** 🌙🛡️
