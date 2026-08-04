import logging
from fastapi import FastAPI, Request, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
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



# Rate Limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# Security Headers Middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        # Security Headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
        response.headers["Cross-Origin-Resource-Policy"] = "same-origin"
        
        # Hardened CSP (Phase 1)
        supabase_url = getattr(settings, "SUPABASE_URL", "https://*.supabase.co")
        csp = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline'; "
            f"img-src 'self' data: {supabase_url}; "
            "font-src 'self'; "
            f"connect-src 'self' {supabase_url}; "
            "object-src 'none'; "
            "base-uri 'self'; "
            "frame-ancestors 'none'; "
            "form-action 'self'; "
            "upgrade-insecure-requests;"
        )
        response.headers["Content-Security-Policy"] = csp
        
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        
        if hasattr(settings, "ENVIRONMENT") and settings.ENVIRONMENT == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
            
        return response

app.add_middleware(SecurityHeadersMiddleware)

from urllib.parse import urlparse

def validate_cors_origin(origin: str) -> None:
    if not origin or origin == "*":
        raise RuntimeError(f"Invalid CORS origin: Cannot use wildcard or empty origin in production. Got: '{origin}'")
        
    parsed = urlparse(origin)
    if parsed.scheme not in ("http", "https"):
        raise RuntimeError(f"Invalid CORS origin scheme for '{origin}'. Must be http or https.")
        
    if parsed.scheme == "http" and parsed.hostname not in {"localhost", "127.0.0.1"}:
        raise RuntimeError(f"Invalid CORS origin for production. Insecure HTTP is only allowed for localhost, got: '{origin}'")

# Set all CORS enabled origins
if settings.FRONTEND_URLS:
    origins = [url.strip() for url in settings.FRONTEND_URLS.split(",") if url.strip()]
    
    if hasattr(settings, "ENVIRONMENT") and settings.ENVIRONMENT == "production":
        for origin in origins:
            validate_cors_origin(origin)
                
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
