import uuid
import time
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
import structlog
from structlog.contextvars import clear_contextvars, bind_contextvars

logger = structlog.get_logger(__name__)

class ObservabilityMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # 1. Clear context vars from previous request (important for async frameworks)
        clear_contextvars()
        
        # 2. Extract or generate Request ID
        request_id = request.headers.get("X-Request-ID")
        if not request_id:
            request_id = str(uuid.uuid4())
            
        # 3. Bind to structured logs
        bind_contextvars(
            request_id=request_id,
            path=request.url.path,
            method=request.method,
            client_ip=request.client.host if request.client else None
        )
        
        # 4. Measure execution time
        start_time = time.perf_counter()
        
        try:
            response = await call_next(request)
        except Exception as e:
            # If an exception escapes up to here, measure time and re-raise
            duration_ms = int((time.perf_counter() - start_time) * 1000)
            logger.error(
                "request_failed_unhandled",
                duration_ms=duration_ms,
                error=str(e)
            )
            raise e
            
        duration_ms = int((time.perf_counter() - start_time) * 1000)
        
        # 5. Attach Server-Timing & X-Request-ID headers
        response.headers["X-Request-ID"] = request_id
        response.headers["Server-Timing"] = f"total;dur={duration_ms}"
        
        # 6. Log the completed request
        # Only log info for typical API/web requests, skip typical healthchecks/metrics if they are too noisy,
        # but for now we log all.
        log_level = logger.info if response.status_code < 400 else logger.warning
        log_level(
            "request_completed",
            status_code=response.status_code,
            duration_ms=duration_ms,
        )
        
        return response
