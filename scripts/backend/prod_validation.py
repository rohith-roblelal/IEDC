import asyncio
import os
import sys
import uuid
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from dotenv import load_dotenv

# Load production env
load_dotenv(".env")

# Must import app after loading env vars
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.main import app
from app.database.session import get_db
from app.models.models import User
from app.auth.security import get_password_hash
from app.models.enums import Role

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("No DATABASE_URL found.")
    sys.exit(1)

engine = create_async_engine(DATABASE_URL)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

TEST_EMAIL = "test_qa_admin_prod@iedcsnmimt.test"
TEST_PASSWORD = "testpassword123"

async def setup_test_admin():
    async with AsyncSessionLocal() as session:
        from sqlalchemy import select, delete
        # Delete if exists
        await session.execute(delete(User).where(User.email == TEST_EMAIL))
        
        test_user = User(
            email=TEST_EMAIL,
            hashed_password=get_password_hash(TEST_PASSWORD),
            role=Role.SUPER_ADMIN
        )
        session.add(test_user)
        await session.commit()
        print(f"Created test admin: {TEST_EMAIL}")

async def cleanup_test_data():
    async with AsyncSessionLocal() as session:
        from sqlalchemy import delete
        from app.models.models import Event, User
        await session.execute(delete(Event).where(Event.title.startswith("TEST_QA_")))
        await session.execute(delete(User).where(User.email == TEST_EMAIL))
        await session.commit()
        print("Cleaned up test data.")

async def run_validation():
    try:
        await setup_test_admin()
        
        # Test API using ASGITransport (avoids needing port 8000 to be open)
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            
            # 1. Test Login (Auth/Cookies)
            print("Testing /api/v1/auth/login...")
            response = await client.post("/api/v1/auth/login", data={"username": TEST_EMAIL, "password": TEST_PASSWORD})
            assert response.status_code == 200, f"Login failed: {response.text}"
            assert "access_token" in response.json()
            token = response.json()["access_token"]
            
            client.headers.update({"Authorization": f"Bearer {token}"})
            
            # 2. Test Event Creation
            print("Testing /api/v1/events (POST)...")
            event_payload = {
                "title": "TEST_QA_PRODUCTION_EVENT",
                "description": "This is a safe test event for production validation.",
                "status": "DRAFT"
            }
            response = await client.post("/api/v1/events", json=event_payload)
            assert response.status_code in (200, 201), f"Create event failed: {response.text}"
            event_id = response.json()["id"]
            
            # 3. Test Event Fetch
            print("Testing /api/v1/events (GET)...")
            response = await client.get("/api/v1/events")
            assert response.status_code == 200
            events = response.json().get("items", response.json())
            assert any(e["id"] == event_id for e in events), "Test event not found in list."
            
            print("Validation passed! All core API functions are working against the production DB.")
            
    finally:
        await cleanup_test_data()

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(run_validation())
