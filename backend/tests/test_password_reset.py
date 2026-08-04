import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from unittest.mock import patch
from app.models.models import User

@pytest.fixture
def mock_email_service():
    with patch("app.api.endpoints.auth.email_service") as mock:
        yield mock

@pytest.mark.asyncio
async def test_valid_password_reset_flow(client: AsyncClient, test_user: User, db_session: AsyncSession, mock_email_service):
    # 1. Request reset token
    response = await client.post(
        "/api/v1/auth/forgot-password",
        json={"email": test_user.email}
    )
    assert response.status_code == 200
    assert "password reset link has been sent" in response.json()["message"]
    
    # 2. Extract token from mocked email service
    assert mock_email_service.send_password_reset_email.called
    call_args = mock_email_service.send_password_reset_email.call_args[0]
    token = call_args[1] # full_token = f"{db_token.id}.{reset_secret}"
    
    # 3. Reset password
    reset_response = await client.post(
        "/api/v1/auth/reset-password",
        json={"token": token, "new_password": "NewStrongPassword123!"}
    )
    assert reset_response.status_code == 200
    
    # 4. Login with new password
    login_response = await client.post(
        "/api/v1/auth/login",
        data={"username": test_user.email, "password": "NewStrongPassword123!"}
    )
    assert login_response.status_code == 200

@pytest.mark.asyncio
async def test_reset_invalid_format(client: AsyncClient):
    # Missing dot separator
    response = await client.post(
        "/api/v1/auth/reset-password",
        json={"token": "invalid_format_token", "new_password": "NewStrongPassword123!"}
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid token format"
    
    # Not a UUID
    response = await client.post(
        "/api/v1/auth/reset-password",
        json={"token": "not-a-uuid.secretstring", "new_password": "NewStrongPassword123!"}
    )
    assert response.status_code == 400

@pytest.mark.asyncio
async def test_reset_wrong_secret(client: AsyncClient, test_user: User, db_session: AsyncSession, mock_email_service):
    await client.post("/api/v1/auth/forgot-password", json={"email": test_user.email})
    token = mock_email_service.send_password_reset_email.call_args[0][1]
    
    token_id = token.split(".")[0]
    wrong_token = f"{token_id}.wrongsecret"
    
    response = await client.post(
        "/api/v1/auth/reset-password",
        json={"token": wrong_token, "new_password": "NewStrongPassword123!"}
    )
    assert response.status_code == 400
    assert "Invalid or expired reset token" in response.json()["detail"]

@pytest.mark.asyncio
async def test_reset_reused_token(client: AsyncClient, test_user: User, db_session: AsyncSession, mock_email_service):
    await client.post("/api/v1/auth/forgot-password", json={"email": test_user.email})
    token = mock_email_service.send_password_reset_email.call_args[0][1]
    
    # First use
    r1 = await client.post("/api/v1/auth/reset-password", json={"token": token, "new_password": "NewStrongPassword123!"})
    assert r1.status_code == 200
    
    # Second use (should fail instantly)
    r2 = await client.post("/api/v1/auth/reset-password", json={"token": token, "new_password": "NewStrongPassword123!"})
    assert r2.status_code == 400

@pytest.mark.asyncio
async def test_reset_invalidates_previous_tokens(client: AsyncClient, test_user: User, db_session: AsyncSession, mock_email_service):
    # First request
    await client.post("/api/v1/auth/forgot-password", json={"email": test_user.email})
    token1 = mock_email_service.send_password_reset_email.call_args[0][1]
    
    # Second request
    await client.post("/api/v1/auth/forgot-password", json={"email": test_user.email})
    token2 = mock_email_service.send_password_reset_email.call_args[0][1]
    
    # First token should now be invalid
    r1 = await client.post("/api/v1/auth/reset-password", json={"token": token1, "new_password": "NewStrongPassword123!"})
    assert r1.status_code == 400
    
    # Second token should work
    r2 = await client.post("/api/v1/auth/reset-password", json={"token": token2, "new_password": "NewStrongPassword123!"})
    assert r2.status_code == 200
