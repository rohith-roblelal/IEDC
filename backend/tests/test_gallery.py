import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.models import User, GalleryImage
from app.models.enums import Role
import uuid

@pytest.mark.asyncio
async def test_get_gallery_empty(client: AsyncClient):
    response = await client.get("/api/v1/gallery")
    assert response.status_code == 200
    assert response.json() == []

@pytest.mark.asyncio
async def test_upload_gallery_image_unauthorized(client: AsyncClient):
    response = await client.post("/api/v1/gallery/upload", data={"title": "Test Image"})
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_upload_gallery_image(admin_client: AsyncClient):
    # Mocking file upload
    file_content = b"fake image content"
    files = {"file": ("test.jpg", file_content, "image/jpeg")}
    data = {
        "title": "Test Image",
        "category": "Event",
        "is_published": "true"
    }
    
    response = await admin_client.post("/api/v1/gallery/upload", data=data, files=files)
    assert response.status_code == 201
    result = response.json()
    assert result["title"] == "Test Image"
    assert result["category"] == "Event"
    assert result["is_published"] is True
    assert "id" in result
    assert "storage_path" in result
    assert "image_url" in result

@pytest.mark.asyncio
async def test_get_published_gallery_images(client: AsyncClient, admin_client: AsyncClient):
    # Upload published image
    files = {"file": ("test1.jpg", b"fake", "image/jpeg")}
    await admin_client.post("/api/v1/gallery/upload", data={"title": "Pub", "is_published": "true"}, files=files)
    
    # Upload draft image
    files2 = {"file": ("test2.jpg", b"fake", "image/jpeg")}
    await admin_client.post("/api/v1/gallery/upload", data={"title": "Draft", "is_published": "false"}, files=files2)
    
    # Unauthenticated user should only see published
    res = await client.get("/api/v1/gallery")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["title"] == "Pub"
    
    # Admin should see both
    res_admin = await admin_client.get("/api/v1/gallery")
    assert res_admin.status_code == 200
    assert len(res_admin.json()) == 2

@pytest.mark.asyncio
async def test_update_gallery_image(admin_client: AsyncClient):
    files = {"file": ("test.jpg", b"fake", "image/jpeg")}
    create_res = await admin_client.post("/api/v1/gallery/upload", data={"title": "Old Title"}, files=files)
    image_id = create_res.json()["id"]
    
    update_res = await admin_client.patch(f"/api/v1/gallery/{image_id}", json={"title": "New Title"})
    assert update_res.status_code == 200
    assert update_res.json()["title"] == "New Title"

@pytest.mark.asyncio
async def test_soft_delete_gallery_image(admin_client: AsyncClient, client: AsyncClient):
    files = {"file": ("test.jpg", b"fake", "image/jpeg")}
    create_res = await admin_client.post("/api/v1/gallery/upload", data={"title": "To Delete", "is_published": "true"}, files=files)
    image_id = create_res.json()["id"]
    
    # Delete image
    del_res = await admin_client.delete(f"/api/v1/gallery/{image_id}")
    assert del_res.status_code == 204
    
    # Check not accessible
    get_res = await admin_client.get("/api/v1/gallery")
    assert get_res.status_code == 200
    assert len(get_res.json()) == 0
