import pytest
from httpx import AsyncClient
from app.models.enums import StartupStage
from app.schemas.startups import StartupCreate

@pytest.fixture
def startup_data():
    return {
        "name": "Test Startup",
        "slug": "test-startup",
        "short_description": "A test startup",
        "full_description": "This is a full description of the test startup.",
        "stage": StartupStage.IDEA.value,
        "is_published": True,
        "is_featured": False
    }

@pytest.mark.asyncio
async def test_create_startup(admin_client: AsyncClient, startup_data: dict):
    response = await admin_client.post("/api/v1/startups", json=startup_data)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == startup_data["name"]
    assert data["slug"] == startup_data["slug"]
    
@pytest.mark.asyncio
async def test_get_public_startups(client: AsyncClient, admin_client: AsyncClient, startup_data: dict):
    # Create startup first
    await admin_client.post("/api/v1/startups", json=startup_data)
    
    response = await client.get("/api/v1/startups")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) >= 1
    
@pytest.mark.asyncio
async def test_get_dashboard_startups(admin_client: AsyncClient, client: AsyncClient):
    # Admin can access
    response = await admin_client.get("/api/v1/startups/dashboard/all")
    assert response.status_code == 200
    
    # Public cannot access
    response_public = await client.get("/api/v1/startups/dashboard/all")
    assert response_public.status_code == 401
    
@pytest.mark.asyncio
async def test_startup_slug_uniqueness(admin_client: AsyncClient, startup_data: dict):
    # First create
    await admin_client.post("/api/v1/startups", json=startup_data)
    
    # Second create with same slug should fail
    response = await admin_client.post("/api/v1/startups", json=startup_data)
    assert response.status_code == 400
    
@pytest.mark.asyncio
async def test_update_startup(admin_client: AsyncClient, startup_data: dict):
    create_resp = await admin_client.post("/api/v1/startups", json=startup_data)
    startup_id = create_resp.json()["id"]
    
    update_data = {"name": "Updated Startup"}
    update_resp = await admin_client.put(f"/api/v1/startups/{startup_id}", json=update_data)
    assert update_resp.status_code == 200
    assert update_resp.json()["name"] == "Updated Startup"
    
@pytest.mark.asyncio
async def test_delete_startup(admin_client: AsyncClient, startup_data: dict):
    create_resp = await admin_client.post("/api/v1/startups", json=startup_data)
    startup_id = create_resp.json()["id"]
    
    delete_resp = await admin_client.delete(f"/api/v1/startups/{startup_id}")
    assert delete_resp.status_code == 204
    
    # Should not be accessible via public anymore
    get_resp = await admin_client.get(f"/api/v1/startups/{startup_id}")
    assert get_resp.status_code == 404
