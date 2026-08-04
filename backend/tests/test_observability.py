import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_request_id_generation_and_propagation():
    """
    Test that X-Request-ID is generated and returned, or propagated if supplied.
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Test 1: Generation
        response1 = await client.get("/api/v1/settings")
        request_id_1 = response1.headers.get("X-Request-ID")
        assert request_id_1 is not None
        
        response2 = await client.get("/api/v1/settings")
        request_id_2 = response2.headers.get("X-Request-ID")
        assert request_id_2 is not None
        assert request_id_1 != request_id_2 # Ensure uniqueness
        
        # Test 2: Propagation
        custom_id = f"custom-{uuid.uuid4()}"
        response3 = await client.get("/api/v1/settings", headers={"X-Request-ID": custom_id})
        assert response3.headers.get("X-Request-ID") == custom_id

@pytest.mark.asyncio
async def test_server_timing_header():
    """
    Test that Server-Timing header is returned on successful requests.
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/settings")
        assert "Server-Timing" in response.headers
        assert "total;dur=" in response.headers["Server-Timing"]

@pytest.mark.asyncio
async def test_error_id_generation():
    """
    Test that Error IDs are generated for exceptions.
    (Testing via validation error for simplicity)
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Trigger 422 Validation Error
        response = await client.post("/api/v1/auth/login", data={"username": "not_an_email"})
        data = response.json()
        assert "error_id" in data
        assert data["error_id"].startswith("ERR-")

def test_sensitive_data_redaction():
    from app.core.logging import redact_sensitive_data
    event = {
        "event": "user_login",
        "password": "supersecretpassword",
        "access_token": "ey12345",
        "email": "test@example.com",
        "Authorization": "Bearer ey12345"
    }
    
    redacted = redact_sensitive_data(None, None, event)
    
    assert redacted["password"] == "[REDACTED]"
    assert redacted["access_token"] == "[REDACTED]"
    assert redacted["Authorization"] == "[REDACTED]"
    assert redacted["email"] == "test@example.com"  # Email itself isn't generically redacted by the processor; user_id is preferred in logic.
