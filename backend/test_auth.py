import asyncio
import httpx
from datetime import datetime, timedelta, timezone
from jose import jwt
from app.core.config import settings

def create_access_token(subject: str, role: str):
    expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode = {"exp": expire, "sub": str(subject), "role": role}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt

token = create_access_token("admin@iedcsnmimt.com", "SUPER_ADMIN")

async def test():
    async with httpx.AsyncClient() as client:
        response = await client.get("http://127.0.0.1:8000/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
        print(response.status_code)
        print(response.text)

asyncio.run(test())
