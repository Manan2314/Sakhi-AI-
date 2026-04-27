import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_create_user():
    print("Testing POST /user...")
    payload = {
        "name": "Test User",
        "phone": "1234567890",
        "email": "test@example.com"
    }
    try:
        response = requests.post(f"{BASE_URL}/user", json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_create_user()
