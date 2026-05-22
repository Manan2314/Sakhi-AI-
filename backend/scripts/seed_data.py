import sys
import os
import random
from datetime import datetime, timedelta
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal, engine, Base
import models

# Ensure tables exist
Base.metadata.create_all(bind=engine)

# Major Delhi Regions
REGIONS = {
    "Connaught Place": (28.6304, 77.2177),
    "Saket": (28.5246, 77.2066),
    "Hauz Khas": (28.5494, 77.2001),
    "Lajpat Nagar": (28.5672, 77.2432),
    "Rohini": (28.7041, 77.1025),
    "Karol Bagh": (28.6524, 77.1889),
    "Dwarka": (28.5823, 77.0500),
    "Rajouri Garden": (28.6415, 77.1198),
    "AIIMS area": (28.5676, 77.2100),
    "South Extension": (28.5684, 77.2201),
    "Nehru Place": (28.5495, 77.2514),
    "Kashmere Gate": (28.6673, 77.2285),
    "Noida border": (28.5700, 77.3200)
}

SAFE_TYPES = ["hospital", "police_station", "metro_station", "24/7_pharmacy", "women_help_center", "late_night_cafe", "mall", "open_commercial_area"]
REPORT_TYPES = ["poor_lighting", "harassment", "unsafe_area", "isolated_areas"]

def generate_random_time(spike_type):
    now = datetime.utcnow()
    # Generate a time within the last 7 days
    base_date = now - timedelta(days=random.randint(0, 7))
    
    if spike_type == "late_night":
        # Between 11 PM and 4 AM
        hour = random.choice([23, 0, 1, 2, 3, 4])
    elif spike_type == "evening_commute":
        # Between 5 PM and 9 PM
        hour = random.randint(17, 21)
    elif spike_type == "weekend_nightlife":
        # Friday/Saturday, 9 PM to 3 AM
        days_to_subtract = base_date.weekday() - 4 # 4 is Friday
        if days_to_subtract < 0: days_to_subtract += 7
        base_date = base_date - timedelta(days=days_to_subtract)
        if random.random() < 0.5:
            base_date = base_date + timedelta(days=1) # Saturday
        hour = random.choice([21, 22, 23, 0, 1, 2, 3])
    else:
        # Random throughout the day
        hour = random.randint(0, 23)
        
    return base_date.replace(hour=hour, minute=random.randint(0, 59), second=random.randint(0, 59))

def seed_data():
    db = SessionLocal()
    
    # 1. Seed User
    if not db.query(models.User).first():
        default_user = models.User(
            name="Pragati",
            email="pragati@sakhi.ai",
            contacts=[
                models.EmergencyContact(name="Mom", phone="+91 98765 43210"),
                models.EmergencyContact(name="Priya (Friend)", phone="+91 87654 32109")
            ]
        )
        db.add(default_user)
        print("Seeded default user.")

    # 2. Seed Safe Places (90 to 120)
    db.query(models.SafePlace).delete()
    num_safe_places = random.randint(90, 120)
    metro_stations = []  # Store to create isolated metro exit reports later
    
    for i in range(num_safe_places):
        region_name, (lat, lng) = random.choice(list(REGIONS.items()))
        # Jitter coordinates up to ~2km (0.02 degrees)
        p_lat = lat + random.uniform(-0.02, 0.02)
        p_lng = lng + random.uniform(-0.02, 0.02)
        p_type = random.choice(SAFE_TYPES)
        
        if p_type == "metro_station":
            metro_stations.append((region_name, p_lat, p_lng))
            
        place = models.SafePlace(
            name=f"{region_name} {p_type.replace('_', ' ').title()}",
            type=p_type,
            latitude=p_lat,
            longitude=p_lng,
            address=f"Near {region_name}, New Delhi",
            phone=f"011-{random.randint(20000000, 29999999)}" if random.random() > 0.3 else None
        )
        db.add(place)
    print(f"Seeded {num_safe_places} safe places across Delhi regions.")

    # 3. Seed Reports (Safety Incidents) (200 to 300)
    db.query(models.Report).delete()
    num_reports = random.randint(200, 300)
    
    # Pre-generate hotspots for micro-clustering
    HOTSPOTS = {
        "nightlife": [],
        "market": [],
        "residential": [],
        "late_night_pocket": [],
        "general": []
    }
    
    for _ in range(3):
        for region in ["Hauz Khas", "Connaught Place"]:
            HOTSPOTS["nightlife"].append((region, REGIONS[region][0] + random.uniform(-0.015, 0.015), REGIONS[region][1] + random.uniform(-0.015, 0.015)))
        for region in ["Lajpat Nagar", "Karol Bagh"]:
            HOTSPOTS["market"].append((region, REGIONS[region][0] + random.uniform(-0.015, 0.015), REGIONS[region][1] + random.uniform(-0.015, 0.015)))
        for region in ["Saket", "Rohini", "Dwarka"]:
            HOTSPOTS["residential"].append((region, REGIONS[region][0] + random.uniform(-0.02, 0.02), REGIONS[region][1] + random.uniform(-0.02, 0.02)))
        for region in ["Kashmere Gate", "Noida border"]:
            HOTSPOTS["late_night_pocket"].append((region, REGIONS[region][0] + random.uniform(-0.015, 0.015), REGIONS[region][1] + random.uniform(-0.015, 0.015)))
        for region in ["AIIMS area", "South Extension", "Rajouri Garden"]:
            HOTSPOTS["general"].append((region, REGIONS[region][0] + random.uniform(-0.02, 0.02), REGIONS[region][1] + random.uniform(-0.02, 0.02)))
            
    for i in range(num_reports):
        profile = random.choices(
            ["nightlife", "market", "residential", "metro_exit", "late_night_pocket", "general"],
            weights=[20, 15, 20, 15, 15, 15],
            k=1
        )[0]
        
        if profile == "metro_exit" and len(metro_stations) > 0:
            region_name, m_lat, m_lng = random.choice(metro_stations)
            # Micro-cluster jitter (~100m)
            r_lat = m_lat + random.uniform(-0.001, 0.001)
            r_lng = m_lng + random.uniform(-0.001, 0.001)
            spike = random.choice(["late_night", "evening_commute"])
            r_type = random.choice(["isolated_areas", "poor_lighting"])
            desc = f"Isolated area outside {region_name} metro station."
        else:
            if profile == "metro_exit": profile = "general"
            
            # 80% chance for a dense micro-cluster (150m), 20% broad scatter (2km)
            region_name, h_lat, h_lng = random.choice(HOTSPOTS[profile])
            if random.random() < 0.8:
                r_lat = h_lat + random.uniform(-0.0015, 0.0015)
                r_lng = h_lng + random.uniform(-0.0015, 0.0015)
            else:
                r_lat = h_lat + random.uniform(-0.02, 0.02)
                r_lng = h_lng + random.uniform(-0.02, 0.02)
                
            if profile == "nightlife":
                spike = random.choices(["weekend_nightlife", "late_night"], weights=[70, 30])[0]
                r_type = random.choices(["harassment", "unsafe_area"], weights=[60, 40])[0]
                desc = f"Nightlife-related {r_type.replace('_', ' ')} incident in {region_name}."
            elif profile == "market":
                spike = "evening_commute"
                r_type = "harassment"
                desc = f"Crowded market {r_type} reported in {region_name}."
            elif profile == "residential":
                spike = "late_night"
                r_type = random.choice(["poor_lighting", "isolated_areas"])
                desc = f"Residential area with {r_type.replace('_', ' ')} near {region_name}."
            elif profile == "late_night_pocket":
                spike = "late_night"
                r_type = random.choice(["unsafe_area", "poor_lighting"])
                desc = f"Late-night {r_type.replace('_', ' ')} incident near {region_name}."
            else: # general
                spike = "random"
                r_type = random.choice(REPORT_TYPES)
                desc = f"{r_type.replace('_', ' ').title()} reported in {region_name} zone."
                
        timestamp = generate_random_time(spike)
        
        report = models.Report(
            type=r_type,
            latitude=r_lat,
            longitude=r_lng,
            description=desc,
            created_at=timestamp
        )
        db.add(report)
        
    print(f"Seeded {num_reports} safety incident reports with realistic temporal and geographical clustering.")

    db.commit()
    db.close()
    print("Database seeding completed.")

if __name__ == "__main__":
    seed_data()
