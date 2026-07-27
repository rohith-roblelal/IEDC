import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.schemas.startups import StartupCreate

payload = {
    "name": "Test Startup",
    "slug": "test-startup",
    "short_description": "Short",
    "full_description": "Full",
    "logo_url": None,
    "founders": [{"name": "Elon", "role": "Founder"}],
    "industry": None,
    "website_url": None,
    "stage": "IDEA",
    "is_published": True,
}

try:
    sc = StartupCreate(**payload)
    print("Success:", sc.model_dump())
except Exception as e:
    print("Validation Error:", e)
