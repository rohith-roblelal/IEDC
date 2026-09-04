import sys
import asyncio

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

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
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

from app.core.config import settings
from app.api.router import api_router
from app.core.rate_limit import limiter
from app.database.session import get_db

import uuid
import structlog
from app.core.logging import setup_logging
from app.api.middleware.observability import ObservabilityMiddleware
from app.api.middleware.metrics import PrometheusMiddleware
from prometheus_client import make_asgi_app
from contextlib import asynccontextmanager
from app.core.redis import get_redis_pool, close_redis
from app.core.arq import init_arq_pool, close_arq_pool
from app.database.session import engine

# Configure structured logging
setup_logging()
logger = structlog.get_logger(__name__)

from app.core.sentry import setup_sentry
from app.core.telemetry import setup_telemetry

# Initialize Sentry before FastAPI application starts
setup_sentry()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize ARQ Pool
    await init_arq_pool(app)
    
    # Validate Redis connection
    try:
        redis_pool = get_redis_pool()
        logger.info("redis_configured", max_connections=settings.REDIS_MAX_CONNECTIONS)
    except Exception as e:
        logger.error("redis_initialization_degraded", error=str(e))
    
    # Test DB connection (Fail fast)
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        logger.info("database_connected")
    except Exception as e:
        logger.warning(
            "database_startup_validation_failed",
            error=str(e),
            environment=settings.ENVIRONMENT,
            message="Continuing startup in non-production mode; database connectivity is degraded.",
        )
        if settings.ENVIRONMENT != "development":
            raise RuntimeError(f"Critical startup dependency failed: PostgreSQL {e}")

    yield

    # Graceful Shutdown
    await close_arq_pool()
    await close_redis()
    await engine.dispose()
    logger.info("shutdown_completed")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Initialize OpenTelemetry after FastAPI app creation
setup_telemetry(app)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    error_id = f"ERR-{uuid.uuid4().hex[:6].upper()}"
    logger.warning("validation_error", error_id=error_id, detail=exc.errors(), path=request.url.path)
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "error_id": error_id},
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    error_id = f"ERR-{uuid.uuid4().hex[:6].upper()}"
    if exc.status_code >= 500:
        logger.error("http_exception", error_id=error_id, status_code=exc.status_code, detail=exc.detail)
    else:
        logger.warning("http_exception", error_id=error_id, status_code=exc.status_code, detail=exc.detail)
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "error_id": error_id},
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    error_id = f"ERR-{uuid.uuid4().hex[:6].upper()}"
    logger.error("unhandled_exception", error_id=error_id, exc_info=exc)
    import sentry_sdk
    with sentry_sdk.push_scope() as scope:
        scope.set_tag("error_id", error_id)
        sentry_sdk.capture_exception(exc)
    return JSONResponse(
        status_code=500, 
        content={"detail": "Internal server error", "error_id": error_id}
    )



# Rate Limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)  # type: ignore

# 1. Trust proxies (X-Forwarded-For) before rate limiting or observability
trusted_hosts = [h.strip() for h in settings.TRUSTED_PROXIES.split(",")] if settings.TRUSTED_PROXIES else []
app.add_middleware(ProxyHeadersMiddleware, trusted_hosts=trusted_hosts)

# 2. Add Observability Middleware so it wraps everything else
app.add_middleware(ObservabilityMiddleware)
app.add_middleware(SlowAPIMiddleware)
app.add_middleware(PrometheusMiddleware)

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

class ContentLengthLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, default_limit: int = 1_048_576, upload_limit: int = 10_485_760):
        super().__init__(app)
        self.default_limit = default_limit
        self.upload_limit = upload_limit

    async def dispatch(self, request: Request, call_next):
        content_length = request.headers.get("content-length")
        if content_length is not None:
            try:
                content_length = int(content_length)
                
                # Check if this is an upload endpoint or a multipart request
                is_upload = "/upload" in request.url.path or "multipart/form-data" in request.headers.get("content-type", "")
                limit = self.upload_limit if is_upload else self.default_limit
                
                if content_length > limit:
                    logger.warning("content_length_exceeded", path=request.url.path, size=content_length, limit=limit)
                    return JSONResponse(
                        status_code=413,
                        content={"detail": "Request body too large"}
                    )
            except ValueError:
                return JSONResponse(status_code=400, content={"detail": "Invalid content-length header"})
                
        return await call_next(request)

app.add_middleware(ContentLengthLimitMiddleware)

class CSRFOriginMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method in ["POST", "PUT", "PATCH", "DELETE"]:
            origin = request.headers.get("origin")
            referer = request.headers.get("referer")
            
            # Extract base origin from referer if origin is missing
            if not origin and referer:
                from urllib.parse import urlparse
                parsed_referer = urlparse(referer)
                origin = f"{parsed_referer.scheme}://{parsed_referer.netloc}"
                
            if origin:
                allowed_origins = [url.strip() for url in settings.FRONTEND_URLS.split(",") if url.strip()]
                if origin not in allowed_origins:
                    logger.warning("csrf_origin_mismatch", expected=allowed_origins, received=origin)
                    return JSONResponse(
                        status_code=403, 
                        content={"detail": "Invalid Origin. Potential CSRF attempt rejected."}
                    )
        
        return await call_next(request)

app.add_middleware(CSRFOriginMiddleware)

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
        allow_methods=["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "Accept", "Cookie", "X-Requested-With"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)

# Mount Prometheus Metrics securely
metrics_app = make_asgi_app()

async def metrics_endpoint(scope, receive, send):
    request = Request(scope, receive)
    token = request.headers.get("Authorization", "")
    expected = getattr(settings, "METRICS_BEARER_TOKEN", None)
    
    if not expected or token != f"Bearer {expected}":
        response = JSONResponse({"detail": "Unauthorized"}, status_code=401)
        await response(scope, receive, send)
        return
    await metrics_app(scope, receive, send)

app.mount("/metrics", metrics_endpoint)

@app.api_route("/", methods=["GET", "HEAD"], include_in_schema=False)
def root():
    return {"message": f"Welcome to the {settings.PROJECT_NAME} API"}


