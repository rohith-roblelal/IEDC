import os
import asyncio
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from alembic.config import Config
from alembic import command
from unittest.mock import patch, MagicMock
from typing import AsyncGenerator

# Load environment variables if running locally without docker
from dotenv import load_dotenv
load_dotenv(".env.test")

# Enforce TEST_DATABASE_URL
TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL")
if not TEST_DATABASE_URL:
    raise ValueError("TEST_DATABASE_URL must be set in the environment or .env.test. Do NOT use your development database!")
    
from sqlalchemy.pool import NullPool
engine = create_async_engine(
    TEST_DATABASE_URL, 
    echo=False, 
    poolclass=NullPool,
    connect_args={"prepared_statement_cache_size": 0}
)

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """
    Run Alembic migrations on the test database at the start of the test session.
    Rolls back (downgrades) at the end.
    """
    sync_url = TEST_DATABASE_URL
    
    alembic_cfg = Config("alembic.ini")
    alembic_cfg.set_main_option("sqlalchemy.url", sync_url)
    
    # Run all migrations up to head
    command.upgrade(alembic_cfg, "head")
    yield
    # No need to drop schema, tests are isolated by transactions
    # and dropping schema breaks asyncpg enum caching in subsequent runs.

@pytest_asyncio.fixture()
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Creates an isolated database session for a single test.
    Starts a transaction and rolls it back after the test completes,
    ensuring a completely clean state for the next test.
    """
    async with engine.connect() as conn:
        transaction = await conn.begin()
        
        async_session = AsyncSession(
            bind=conn, 
            join_transaction_mode="create_savepoint",
            expire_on_commit=False
        )
        
        yield async_session
        
        await async_session.close()
        await transaction.rollback()

@pytest_asyncio.fixture()
async def client(db_session: AsyncSession):
    """
    Returns an async httpx TestClient pointing to the FastAPI app.
    Overrides `get_db` to use the transactional `db_session`.
    """
    from app.main import app
    from app.database.session import get_db
    
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c
        
    app.dependency_overrides.clear()

# --- External Service Mocks ---

@pytest.fixture(autouse=True)
def mock_supabase_storage():
    if os.getenv("USE_LIVE_SERVICES") == "1":
        yield
        return
        
    with patch("app.core.supabase.supabase_client") as mock_client:
        mock_bucket = MagicMock()
        mock_bucket.upload.return_value = {"Key": "test-image.jpg"}
        mock_bucket.get_public_url.return_value = "http://mock-supabase.com/test-image.jpg"
        mock_bucket.remove.return_value = True
        
        mock_client.storage.from_.return_value = mock_bucket
        yield mock_client

@pytest.fixture(autouse=True)
def mock_google_forms():
    """Automatically mock Google Forms sync to prevent real API calls unless live."""
    if os.getenv("USE_LIVE_SERVICES") == "1":
        yield
        return
        
    with patch("app.services.google_form.GoogleFormService.submit_registration") as mock_submit:
        mock_submit.return_value = True
        yield mock_submit

@pytest.fixture(autouse=True)
def mock_smtp_email():
    """Automatically mock email sending to prevent real emails being sent during tests unless live."""
    if os.getenv("USE_LIVE_SERVICES") == "1":
        yield
        return
        
    with patch("app.services.email.send_reply_email") as mock_email:
        mock_email.return_value = True
        yield mock_email

from app.models.models import User
from app.auth.security import get_password_hash
from app.models.enums import Role

@pytest_asyncio.fixture()
async def test_user(db_session: AsyncSession) -> User:
    """Creates a default admin user for testing."""
    user = User(
        email="admin@test.com",
        hashed_password=get_password_hash("testpassword123"),
        role=Role.SUPER_ADMIN
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user

@pytest_asyncio.fixture()
async def admin_client(db_session: AsyncSession, test_user: User) -> AsyncGenerator[AsyncClient, None]:
    """Returns a TestClient authenticated as the test admin user."""
    from app.main import app
import os
import asyncio
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from alembic.config import Config
from alembic import command
from unittest.mock import patch, MagicMock
from typing import AsyncGenerator

# Load environment variables if running locally without docker
from dotenv import load_dotenv
load_dotenv(".env.test")

# Enforce TEST_DATABASE_URL
TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL")
if not TEST_DATABASE_URL:
    raise ValueError("TEST_DATABASE_URL must be set in the environment or .env.test. Do NOT use your development database!")
    
from sqlalchemy.pool import NullPool
engine = create_async_engine(
    TEST_DATABASE_URL, 
    echo=False, 
    poolclass=NullPool,
    connect_args={"prepared_statement_cache_size": 0}
)

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """
    Run Alembic migrations on the test database at the start of the test session.
    Rolls back (downgrades) at the end.
    """
    sync_url = TEST_DATABASE_URL
    
    alembic_cfg = Config("alembic.ini")
    alembic_cfg.set_main_option("sqlalchemy.url", sync_url)
    
    # Run all migrations up to head (disabled locally for Neon to avoid cache corruption)
    if "neon.tech" not in sync_url:
        command.upgrade(alembic_cfg, "head")
    yield
    # No need to drop schema, tests are isolated by transactions
    # and dropping schema breaks asyncpg enum caching in subsequent runs.

@pytest_asyncio.fixture()
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Creates an isolated database session for a single test.
    Starts a transaction and rolls it back after the test completes,
    ensuring a completely clean state for the next test.
    """
    async with engine.connect() as conn:
        transaction = await conn.begin()
        
        async_session = AsyncSession(
            bind=conn, 
            join_transaction_mode="create_savepoint",
            expire_on_commit=False
        )
        
        yield async_session
        
        await async_session.close()
        await transaction.rollback()

@pytest_asyncio.fixture()
async def client(db_session: AsyncSession):
    """
    Returns an async httpx TestClient pointing to the FastAPI app.
    Overrides `get_db` to use the transactional `db_session`.
    """
    from app.main import app
    from app.database.session import get_db
    
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    if hasattr(app.state, "limiter"):
        app.state.limiter.enabled = False
        
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c
        
    app.dependency_overrides.clear()

# --- External Service Mocks ---

@pytest.fixture(autouse=True)
def mock_supabase_storage():
    if os.getenv("USE_LIVE_SERVICES") == "1":
        yield
        return
        
    with patch("app.core.supabase.supabase_client") as mock_client:
        mock_bucket = MagicMock()
        mock_bucket.upload.return_value = {"Key": "test-image.jpg"}
        mock_bucket.get_public_url.return_value = "http://mock-supabase.com/test-image.jpg"
        mock_bucket.remove.return_value = True
        
        mock_client.storage.from_.return_value = mock_bucket
        yield mock_client

@pytest.fixture(autouse=True)
def mock_google_forms():
    """Automatically mock Google Forms sync to prevent real API calls unless live."""
    if os.getenv("USE_LIVE_SERVICES") == "1":
        yield
        return
        
    with patch("app.services.google_form.GoogleFormService.submit_registration") as mock_submit:
        mock_submit.return_value = True
        yield mock_submit

@pytest.fixture(autouse=True)
def mock_smtp_email():
    """Automatically mock email sending to prevent real emails being sent during tests unless live."""
    if os.getenv("USE_LIVE_SERVICES") == "1":
        yield
        return
        
    with patch("app.services.email.send_reply_email") as mock_email:
        mock_email.return_value = True
        yield mock_email

from app.models.models import User
from app.auth.security import get_password_hash
from app.models.enums import Role

@pytest_asyncio.fixture()
async def test_user(db_session: AsyncSession) -> User:
    """Creates a default admin user for testing."""
    user = User(
        email="admin@test.com",
        hashed_password=get_password_hash("testpassword123"),
        role=Role.SUPER_ADMIN
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user

@pytest_asyncio.fixture()
async def admin_client(db_session: AsyncSession, test_user: User) -> AsyncGenerator[AsyncClient, None]:
    """Returns a TestClient authenticated as the test admin user."""
    from app.main import app
    from app.database.session import get_db
    
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    if hasattr(app.state, "limiter"):
        app.state.limiter.enabled = False
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        res = await c.post(
            "/api/v1/auth/login",
            data={"username": test_user.email, "password": "testpassword123"}
        )
        assert res.status_code == 200, f"Login failed: {res.text}"
        yield c
        
    app.dependency_overrides.clear()
