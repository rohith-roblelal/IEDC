import time
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
from prometheus_client import Counter, Histogram, Gauge

# Prometheus Metrics Definitions
HTTP_REQUESTS_TOTAL = Counter(
    "http_requests_total", 
    "Total HTTP Requests", 
    ["method", "endpoint", "status_code"]
)

HTTP_REQUEST_DURATION_SECONDS = Histogram(
    "http_request_duration_seconds",
    "HTTP Request Duration",
    ["method", "endpoint", "status_code"],
    buckets=[0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0]
)

ACTIVE_REQUESTS = Gauge(
    "http_active_requests",
    "Number of active HTTP requests",
    ["method", "endpoint"]
)

class PrometheusMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        method = request.method
        # We group endpoints by route path if possible to avoid high cardinality
        endpoint = request.scope.get("route", request.url.path)
        if hasattr(endpoint, "path"):
            endpoint = endpoint.path
        else:
            # Simple fallback to avoid cardinality explosion for /events/123 -> /events/{id}
            # FastAPI's router usually attaches 'route' late, so this might just be raw path.
            # In a real app we might rely on APIRoute parsing, but for now we'll clean UUIDs.
            import re
            endpoint = re.sub(r"/[a-f0-9\-]{36}", "/{uuid}", endpoint)
            endpoint = re.sub(r"/\d+", "/{id}", endpoint)

        # Do not track metrics endpoint itself
        if endpoint == "/metrics":
            return await call_next(request)

        ACTIVE_REQUESTS.labels(method=method, endpoint=endpoint).inc()
        start_time = time.perf_counter()
        
        status_code = 500
        try:
            response = await call_next(request)
            status_code = response.status_code
        except Exception as e:
            status_code = 500
            raise e
        finally:
            duration = time.perf_counter() - start_time
            ACTIVE_REQUESTS.labels(method=method, endpoint=endpoint).dec()
            HTTP_REQUESTS_TOTAL.labels(method=method, endpoint=endpoint, status_code=status_code).inc()
            HTTP_REQUEST_DURATION_SECONDS.labels(method=method, endpoint=endpoint, status_code=status_code).observe(duration)
            
        return response
