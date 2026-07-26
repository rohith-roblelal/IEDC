import logging
from fastapi import FastAPI, Request, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy import text

from app.core.config import settings
from app.api.router import api_router
from app.core.rate_limit import limiter
from app.database.session import get_db

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception", exc_info=exc)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})

# -------------------------------------------------
# Automatic DB migration on startup (ensures schema is up‑to‑date
# for any environment – local dev, test, or Render production).
# -------------------------------------------------
@app.on_event("startup")
async def run_migrations_on_startup():
    """Run Alembic migrations via subprocess to avoid event-loop conflicts.

    Alembic's async env.py calls asyncio.run(), which cannot run inside
    FastAPI's already-running loop. Spawning a subprocess gives Alembic
    its own Python process and event loop — works on Windows, Linux, and Render.
    """
    import asyncio
    import sys
    from pathlib import Path

    # Find the backend directory (where alembic.ini lives)
    backend_dir = Path(__file__).resolve().parents[1]
    alembic_ini = backend_dir / "alembic.ini"
    if not alembic_ini.is_file():
        logger.warning(f"alembic.ini not found at {alembic_ini}, skipping auto-migration.")
        return

    try:
        proc = await asyncio.create_subprocess_exec(
            sys.executable, "-m", "alembic", "upgrade", "head",
            cwd=str(backend_dir),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await proc.communicate()

        if proc.returncode == 0:
            logger.info("Database migrations applied successfully.")
        else:
            logger.error(
                f"Alembic migration failed (exit {proc.returncode}):\n"
                f"{stderr.decode().strip()}"
            )
    except Exception as e:
        logger.error("Failed to run migration subprocess", exc_info=e)

# Rate Limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security Headers Middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        # Security Headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        
        if hasattr(settings, "ENVIRONMENT") and settings.ENVIRONMENT == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
            
        return response

app.add_middleware(SecurityHeadersMiddleware)

# Set all CORS enabled origins
if settings.FRONTEND_URLS:
    origins = [url.strip() for url in settings.FRONTEND_URLS.split(",")]
    
    if hasattr(settings, "ENVIRONMENT") and settings.ENVIRONMENT == "production":
        for origin in origins:
            if origin == "*" or "http://" in origin and "localhost" not in origin:
                raise RuntimeError("Invalid CORS origin for production environment. Cannot use wildcard or insecure HTTP.")
                
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {"message": f"Welcome to the {settings.PROJECT_NAME} API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/health/ready")
async def health_ready(db=Depends(get_db)):
    try:
        await db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return JSONResponse(
            status_code=503,
            content={"status": "error", "database": "disconnected"}
        )
