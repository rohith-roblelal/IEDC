import hashlib
from typing import Callable, Optional
from fastapi import Request, Response
from fastapi.routing import APIRoute

def cache_control(max_age: int, s_maxage: int, stale_while_revalidate: int = 86400):
    """
    Dependency to inject Cache-Control headers into the response.
    """
    def _dependency(response: Response, request: Request):
        # Do not cache if Authorization or Cookie header implies an authenticated request,
        # unless we explicitly allow it. But usually public endpoints won't have these.
        if "Authorization" in request.headers or "access_token" in request.cookies:
            response.headers["Cache-Control"] = "no-store"
        else:
            response.headers["Cache-Control"] = f"public, max-age={max_age}, s-maxage={s_maxage}, stale-while-revalidate={stale_while_revalidate}"
    return _dependency

class ETagRoute(APIRoute):
    """
    Custom APIRoute that automatically generates an ETag based on the response body 
    and handles If-None-Match headers for 304 Not Modified responses.
    """
    def get_route_handler(self) -> Callable:
        original_route_handler = super().get_route_handler()

        async def custom_route_handler(request: Request) -> Response:
            response = await original_route_handler(request)
            
            if request.method in ["GET", "HEAD"] and response.status_code == 200:
                # We can only hash if the response has a fully rendered body (e.g. JSONResponse)
                if hasattr(response, "body"):
                    etag = hashlib.md5(response.body).hexdigest()
                    etag_val = f'W/"{etag}"'
                    response.headers["ETag"] = etag_val
                    
                    if request.headers.get("if-none-match") == etag_val:
                        return Response(status_code=304, headers=response.headers)
            return response

        return custom_route_handler
