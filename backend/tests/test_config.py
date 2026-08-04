import pytest
from pydantic import ValidationError
import os
from unittest.mock import patch

# Mock environment variables to prevent loading from local .env
@pytest.fixture(autouse=True)
def mock_env():
    with patch.dict(os.environ, clear=True):
        yield

def test_valid_development_config():
    """Test that the application starts successfully with valid development settings."""
    from app.core.config import Settings
    settings = Settings(
        ENVIRONMENT="development",
        SECRET_KEY="short-secret-is-okay-in-dev-12345",
        DATABASE_URL="postgresql://user:pass@localhost:5432/db",
        FIRST_SUPERADMIN_PASSWORD="admin",
        SUPABASE_URL="http://localhost:8000",
        SUPABASE_SERVICE_ROLE_KEY="dummy-key",
        FRONTEND_URLS="http://localhost:3000",
    )
    assert settings.ENVIRONMENT == "development"

def test_production_weak_secret_key():
    """Test that production rejects weak or short secret keys."""
    from app.core.config import Settings
    
    with pytest.raises(ValidationError) as exc_info:
        Settings(
            ENVIRONMENT="production",
            SECRET_KEY="short-key-rejected",
            DATABASE_URL="postgresql://user:pass@localhost:5432/db",
            FIRST_SUPERADMIN_PASSWORD="admin",
            SUPABASE_URL="https://valid.supabase.co",
            SUPABASE_SERVICE_ROLE_KEY="dummy-key",
            FRONTEND_URLS="https://myapp.com",
        )
    assert "SECRET_KEY must be at least 64 characters long in production" in str(exc_info.value)
    
    with pytest.raises(ValidationError) as exc_info2:
        Settings(
            ENVIRONMENT="production",
            SECRET_KEY="changeme" + "a" * 60, # Contains placeholder
            DATABASE_URL="postgresql://user:pass@localhost:5432/db",
            FIRST_SUPERADMIN_PASSWORD="admin",
            SUPABASE_URL="https://valid.supabase.co",
            SUPABASE_SERVICE_ROLE_KEY="dummy-key",
            FRONTEND_URLS="https://myapp.com",
        )
    assert "SECRET_KEY is too weak or uses a placeholder in production" in str(exc_info2.value)

def test_production_http_urls_rejected():
    """Test that production requires HTTPS for external services."""
    from app.core.config import Settings
    
    with pytest.raises(ValidationError) as exc_info:
        Settings(
            ENVIRONMENT="production",
            SECRET_KEY="abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ12345", # valid length and entropy
            DATABASE_URL="postgresql://user:pass@localhost:5432/db",
            FIRST_SUPERADMIN_PASSWORD="admin",
            SUPABASE_URL="http://insecure.supabase.co", # HTTP should fail
            SUPABASE_SERVICE_ROLE_KEY="dummy-key",
            FRONTEND_URLS="https://myapp.com",
        )
    assert "SUPABASE_URL must be an HTTPS URL in production" in str(exc_info.value)

def test_production_debug_rejected():
    """Test that DEBUG and RELOAD cannot be True in production."""
    from app.core.config import Settings
    
    with pytest.raises(ValidationError) as exc_info:
        Settings(
            ENVIRONMENT="production",
            SECRET_KEY="abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ12345",
            DATABASE_URL="postgresql://user:pass@localhost:5432/db",
            FIRST_SUPERADMIN_PASSWORD="admin",
            SUPABASE_URL="https://valid.supabase.co",
            SUPABASE_SERVICE_ROLE_KEY="dummy-key",
            FRONTEND_URLS="https://myapp.com",
            DEBUG=True
        )
    assert "DEBUG and RELOAD must be False in production" in str(exc_info.value)

def test_database_url_format():
    """Test that DATABASE_URL must start with postgres."""
    from app.core.config import Settings
    
    with pytest.raises(ValidationError) as exc_info:
        Settings(
            ENVIRONMENT="development",
            SECRET_KEY="short-secret-is-okay-in-dev-12345",
            DATABASE_URL="mysql://user:pass@localhost:3306/db", # Invalid
            FIRST_SUPERADMIN_PASSWORD="admin",
            SUPABASE_URL="https://valid.supabase.co",
            SUPABASE_SERVICE_ROLE_KEY="dummy-key",
            FRONTEND_URLS="https://myapp.com",
        )
    assert "DATABASE_URL must start with 'postgres'" in str(exc_info.value)
