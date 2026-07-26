import pytest
from httpx import AsyncClient

@pytest.fixture
def announcement_data():
    return {
        "title": "Test Announcement",
        "content": "This is a test announcement content.",
        "is_published": True,
        "is_pinned": False,
        "target_audience": "All"
    }

@pytest.mark.asyncio
async def test_create_announcement_unauthorized(client: AsyncClient, announcement_data: dict):
    """Ensure unauthenticated users cannot create announcements."""
    response = await client.post("/api/v1/announcements", json=announcement_data)
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_create_announcement_authorized(admin_client: AsyncClient, announcement_data: dict):
    """Ensure authenticated admins can create announcements."""
    response = await admin_client.post("/api/v1/announcements", json=announcement_data)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == announcement_data["title"]
    assert "id" in data
    
@pytest.mark.asyncio
async def test_get_announcements_public(client: AsyncClient, admin_client: AsyncClient, announcement_data: dict):
    """Test retrieving published announcements publicly."""
    # Create an announcement first
    await admin_client.post("/api/v1/announcements", json=announcement_data)
    
    response = await client.get("/api/v1/announcements")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) >= 1
    assert data["items"][0]["title"] == announcement_data["title"]

@pytest.mark.asyncio
async def test_soft_delete_announcement(admin_client: AsyncClient, client: AsyncClient, announcement_data: dict):
    """Test that deleting an announcement removes it from public view."""
    # 1. Create Announcement
    create_res = await admin_client.post("/api/v1/announcements", json=announcement_data)
    assert create_res.status_code == 200
    announcement_id = create_res.json()["id"]
    
    # 2. Verify it exists
    get_res = await admin_client.get(f"/api/v1/announcements/{announcement_id}")
    assert get_res.status_code == 200
    
    # 3. Delete it
    del_res = await admin_client.delete(f"/api/v1/announcements/{announcement_id}")
    assert del_res.status_code == 204
    
    # 4. Verify it's no longer returned
    get_res_after = await admin_client.get(f"/api/v1/announcements/{announcement_id}")
    assert get_res_after.status_code == 404
