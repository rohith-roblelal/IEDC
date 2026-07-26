import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_event_unauthorized(client: AsyncClient):
    """Ensure unauthenticated users cannot create events."""
    event_data = {
        "title": "Test Event",
        "description": "This is a test event.",
        "is_published": False
    }
    response = await client.post("/api/v1/events", json=event_data)
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_create_event_authorized(admin_client: AsyncClient):
    """Ensure authenticated admins can create events."""
    event_data = {
        "title": "Hackathon 2026",
        "description": "Annual hackathon",
        "is_published": True
    }
    response = await admin_client.post("/api/v1/events", json=event_data)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Hackathon 2026"
    assert "slug" in data
    assert "id" in data
    
    return data["id"]

@pytest.mark.asyncio
async def test_get_events(client: AsyncClient, admin_client: AsyncClient):
    """Test retrieving the list of events and pagination."""
    # Create 3 events
    for i in range(3):
        await admin_client.post("/api/v1/events", json={
            "title": f"Event {i}",
            "description": "Desc",
            "is_published": True
        })
        
    response = await client.get("/api/v1/events")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) >= 3

@pytest.mark.asyncio
async def test_soft_delete_event(admin_client: AsyncClient, client: AsyncClient):
    """Test that deleting an event sets deleted_at and hides it from list views."""
    # 1. Create Event
    create_res = await admin_client.post("/api/v1/events", json={
        "title": "To Be Deleted",
        "description": "Desc",
        "is_published": True
    })
    event_slug = create_res.json()["slug"]
    event_id = create_res.json()["id"]
    
    # 2. Verify it exists
    get_res = await client.get(f"/api/v1/events/{event_slug}")
    assert get_res.status_code == 200
    
    # 3. Delete it
    del_res = await admin_client.delete(f"/api/v1/events/{event_id}")
    assert del_res.status_code == 204
    
    # 4. Verify it's no longer returned
    get_res_after = await client.get(f"/api/v1/events/{event_slug}")
    assert get_res_after.status_code == 404
