import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.models.models import User
from app.auth.security import get_password_hash
from app.models.enums import Role
from datetime import datetime, timezone

@pytest.fixture
async def active_admin_user(db_session: AsyncSession) -> User:
    admin = User(
        email="admin_integration@test.com",
        hashed_password=get_password_hash("testpassword123"),
        role=Role.SUPER_ADMIN
    )
    db_session.add(admin)
    await db_session.commit()
    await db_session.refresh(admin)
    return admin

@pytest.fixture
async def deleted_admin_user(db_session: AsyncSession) -> User:
    admin = User(
        email="deleted_admin@test.com",
        hashed_password=get_password_hash("testpassword123"),
        role=Role.SUPER_ADMIN,
        deleted_at=datetime.now(timezone.utc)
    )
    db_session.add(admin)
    await db_session.commit()
    await db_session.refresh(admin)
    return admin

@pytest.mark.asyncio
async def test_login_logout_flow(client: AsyncClient, active_admin_user: User):
    """Test full login and logout flow."""
    # Login
    login_response = await client.post(
        "/api/v1/auth/login",
        data={"username": "admin_integration@test.com", "password": "testpassword123"}
    )
    assert login_response.status_code == 200
    
    # Check that HttpOnly cookie is set
    cookies = login_response.cookies
    assert "access_token" in cookies
    
    # Check if we can access protected endpoint using the cookie
    me_response = await client.get("/api/v1/users")
    assert me_response.status_code == 200
    assert "items" in me_response.json()
    
    # Logout
    logout_response = await client.post("/api/v1/auth/logout")
    assert logout_response.status_code == 200
    assert logout_response.json()["message"] == "Logged out successfully"
    
    # Check that cookie is cleared
    # The set-cookie header should have max-age=0 or expires in the past
    assert "access_token" not in logout_response.cookies or not logout_response.cookies.get("access_token")

@pytest.mark.asyncio
async def test_cookie_security_flags(client: AsyncClient, active_admin_user: User):
    """Test that authentication cookie has HttpOnly, Secure(in production normally), and SameSite."""
    login_response = await client.post(
        "/api/v1/auth/login",
        data={"username": "admin_integration@test.com", "password": "testpassword123"}
    )
    assert login_response.status_code == 200
    
    # We must inspect the Set-Cookie header directly to check flags since httpx Cookies object 
    # doesn't easily expose the raw flags in a cross-platform way.
    set_cookie_header = login_response.headers.get("set-cookie", "").lower()
    
    assert "access_token=" in set_cookie_header
    assert "httponly" in set_cookie_header
    assert "samesite=lax" in set_cookie_header
    
@pytest.mark.asyncio
async def test_soft_deleted_user_cannot_login(client: AsyncClient, deleted_admin_user: User):
    """Test that a soft-deleted user cannot log in."""
    login_response = await client.post(
        "/api/v1/auth/login",
        data={"username": "deleted_admin@test.com", "password": "testpassword123"}
    )
    
    # The system should pretend the user doesn't exist or is invalid to avoid leaking existence
    assert login_response.status_code == 400
    assert login_response.json()["detail"] == "Incorrect email or password"

@pytest.mark.asyncio
async def test_protected_endpoint_without_cookie(client: AsyncClient):
    """Test that accessing a protected endpoint without a cookie returns 401."""
    # Ensure no cookies are set
    client.cookies.clear()
    
    response = await client.get("/api/v1/users")
    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"

@pytest.mark.asyncio
async def test_invalid_cookie_rejected(client: AsyncClient):
    """Test that a fake or invalid cookie is rejected."""
    client.cookies.set("access_token", "fake.jwt.token")
    
    response = await client.get("/api/v1/users")
    assert response.status_code == 401
    
@pytest.mark.asyncio
async def test_soft_delete_enforcement_on_active_session(client: AsyncClient, active_admin_user: User, db_session: AsyncSession):
    """Test that an active session becomes invalid if the user is soft-deleted in the DB."""
    # 1. Login
    login_response = await client.post(
        "/api/v1/auth/login",
        data={"username": "admin_integration@test.com", "password": "testpassword123"}
    )
    assert login_response.status_code == 200
    
    # 2. Verify access works
    me_response1 = await client.get("/api/v1/users")
    assert me_response1.status_code == 200
    
    # 3. Soft-delete the user directly in DB
    active_admin_user.deleted_at = datetime.now(timezone.utc)
    db_session.add(active_admin_user)
    await db_session.commit()
    
    # 4. Verify access is now denied despite having a valid JWT token
    me_response2 = await client.get("/api/v1/users")
    assert me_response2.status_code in (401, 404)
    # Note: Depending on implementation, it might say "User not found" or "Not authenticated"
