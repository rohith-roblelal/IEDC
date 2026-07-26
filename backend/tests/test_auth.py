import pytest
from httpx import AsyncClient
from app.models.models import User

@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, test_user: User):
    """Test that a valid user can log in and receive an HttpOnly cookie."""
    response = await client.post(
        "/api/v1/auth/login",
        data={"username": "admin@test.com", "password": "testpassword123"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "user" in data
    
    # Check that the HttpOnly cookie is set
    cookies = response.cookies
    assert "access_token" in cookies
    
@pytest.mark.asyncio
async def test_login_invalid_password(client: AsyncClient, test_user: User):
    """Test that an invalid password returns 400."""
    response = await client.post(
        "/api/v1/auth/login",
        data={"username": "admin@test.com", "password": "wrongpassword"}
    )
    
    assert response.status_code == 400
    assert response.json()["detail"] == "Incorrect email or password"

@pytest.mark.asyncio
async def test_login_nonexistent_user(client: AsyncClient):
    """Test that a nonexistent user returns 400."""
    response = await client.post(
        "/api/v1/auth/login",
        data={"username": "doesnotexist@test.com", "password": "testpassword123"}
    )
    
    assert response.status_code == 400
    assert response.json()["detail"] == "Incorrect email or password"

@pytest.mark.asyncio
async def test_login_rate_limiting(client: AsyncClient):
    """Test that rate limiting blocks excessive login attempts (5/min)."""
    from app.main import app
    app.state.limiter.enabled = True
    try:
        # Make 5 failed attempts
        for _ in range(5):
            res = await client.post(
                "/api/v1/auth/login",
                data={"username": "admin@test.com", "password": "wrong"}
            )
            # Some might be 400 if it passes rate limit, but it will eventually hit 429
        
        # The 6th attempt should be blocked
        response = await client.post(
            "/api/v1/auth/login",
            data={"username": "admin@test.com", "password": "wrong"}
        )
        
        assert response.status_code == 429
        assert "Rate limit exceeded" in response.text
    finally:
        app.state.limiter.enabled = False
