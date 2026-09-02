from slowapi import Limiter
from slowapi.util import get_remote_address
import os
from fastapi import Request

# Initialize limiter. We'll set the storage backend dynamically during startup in main.py
# or we can pass a dummy redis string here, but since slowapi can take a string for redis, 
# let's just initialize it with the redis URL from config if it's available.
from app.core.config import settings

def get_user_ip_and_id(request: Request) -> str:
    """Extracts IP and User ID (if authenticated) for multi-dimensional rate limiting."""
    ip = get_remote_address(request)
    auth = request.headers.get("Authorization")
    if auth and auth.startswith("Bearer "):
        token = auth.split(" ")[1]
        try:
            import jwt
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=[settings.JWT_ALGORITHM],
                issuer=settings.JWT_ISSUER,
                audience=settings.JWT_AUDIENCE,
                options={"require": ["sub", "role", "jti", "exp", "iat", "nbf"]},
            )

            user_id = payload.get("sub")
            if user_id:
                return f"{ip}:{user_id}"
        except jwt.InvalidTokenError:
            pass
    return ip

limiter = Limiter(
    key_func=get_user_ip_and_id, 
    default_limits=["100/minute"],
    storage_uri=settings.REDIS_URL,
    swallow_errors=True,
    in_memory_fallback_enabled=True,
    in_memory_fallback=["100/minute"]
)
