import asyncio
import httpx
from datetime import datetime, timedelta, timezone
from jose import jwt
from sqlalchemy import select
import sys
import time

if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from app.core.config import settings
from app.models.models import User
from app.database.session import SessionLocal

def create_access_token(subject: str, role: str):
    expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode = {"exp": expire, "sub": str(subject), "role": role}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt

async def test():
    async with SessionLocal() as session:
        result = await session.execute(select(User).limit(1))
        user = result.scalar_one_or_none()
        
    if not user:
        print("No user found in DB to test with")
        return
        
    token = create_access_token(user.id, user.role.value if hasattr(user.role, 'value') else user.role)
    
    async with httpx.AsyncClient() as client:
        start = time.time()
        print(f"Requesting /api/v1/dashboard with user {user.id}")
        try:
            response = await client.get("http://127.0.0.1:8000/api/v1/dashboard", headers={"Authorization": f"Bearer {token}"}, timeout=20.0)
            end = time.time()
            print(f"Status: {response.status_code}")
            print(f"Time: {end-start:.4f}s")
            print(f"Response: {response.text[:200]}")
        except Exception as e:
            print("HTTPX Error:", repr(e))

asyncio.run(test())
