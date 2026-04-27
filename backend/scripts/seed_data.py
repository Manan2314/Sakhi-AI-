import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal, engine, Base
import models

# Ensure tables exist
Base.metadata.create_all(bind=engine)

def seed_data():
    db = SessionLocal()
    
    # Check if data already exists
    if db.query(models.SafePlace).first():
        print("Data already seeded.")
        return

    # User
    default_user = models.User(
        name="Pragati",
        email="pragati@sakhi.ai",
        emergency_contacts=[
            {"name": "Mom", "phone": "+91 98765 43210"},
            {"name": "Priya (Friend)", "phone": "+91 87654 32109"}
        ]
    )
    db.add(default_user)

    # Safe Places from delhiData.ts
    safe_places = [
        {"name": "AIIMS Hospital", "latitude": 28.5676, "longitude": 77.2100, "type": "hospital", "address": "Ansari Nagar, New Delhi", "phone": "011-26588500"},
        {"name": "Safdarjung Hospital", "latitude": 28.5688, "longitude": 77.2040, "type": "hospital", "address": "Safdarjung Enclave, New Delhi", "phone": "011-24673012"},
        {"name": "Ram Manohar Lohia Hospital", "latitude": 28.6272, "longitude": 77.1990, "type": "hospital", "address": "Baba Kharak Singh Marg, New Delhi", "phone": "011-23404000"},
        {"name": "Apollo Hospital Delhi", "latitude": 28.5527, "longitude": 77.2773, "type": "hospital", "address": "Mathura Road, New Delhi", "phone": "011-71791090"},
        {"name": "Connaught Place Police Station", "latitude": 28.6329, "longitude": 77.2195, "type": "police", "address": "Connaught Place, New Delhi", "phone": "011-23340000"},
        {"name": "Lajpat Nagar Police Station", "latitude": 28.5672, "longitude": 77.2432, "type": "police", "address": "Lajpat Nagar, New Delhi", "phone": "011-29836018"},
        {"name": "Saket Police Station", "latitude": 28.5203, "longitude": 77.2150, "type": "police", "address": "Saket, New Delhi", "phone": "011-29562400"},
        {"name": "Karol Bagh Police Station", "latitude": 28.6524, "longitude": 77.1889, "type": "police", "address": "Karol Bagh, New Delhi", "phone": "011-28752345"},
        {"name": "Hauz Khas Police Station", "latitude": 28.5494, "longitude": 77.2001, "type": "police", "address": "Hauz Khas, New Delhi", "phone": "011-26183020"},
        {"name": "Rajiv Chowk Metro Station", "latitude": 28.6331, "longitude": 77.2194, "type": "metro", "address": "Connaught Place, New Delhi"},
        {"name": "Kashmere Gate Metro Station", "latitude": 28.6673, "longitude": 77.2285, "type": "metro", "address": "Kashmere Gate, New Delhi"},
        {"name": "Saket Metro Station", "latitude": 28.5224, "longitude": 77.2188, "type": "metro", "address": "Saket, South Delhi"},
        {"name": "Hauz Khas Metro Station", "latitude": 28.5434, "longitude": 77.2066, "type": "metro", "address": "Hauz Khas, South Delhi"},
        {"name": "Karol Bagh Metro Station", "latitude": 28.6516, "longitude": 77.1893, "type": "metro", "address": "Karol Bagh, New Delhi"},
        {"name": "India Gate", "latitude": 28.6129, "longitude": 77.2295, "type": "landmark", "address": "Rajpath, New Delhi"},
        {"name": "Red Fort", "latitude": 28.6562, "longitude": 77.2410, "type": "landmark", "address": "Netaji Subhash Marg, Old Delhi"}
    ]

    for place in safe_places:
        db.add(models.SafePlace(**place))
    
    db.commit()
    db.close()
    print("Database seeded successfully.")

if __name__ == "__main__":
    seed_data()
