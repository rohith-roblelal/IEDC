from slowapi import Limiter
from slowapi.util import get_remote_address
import os

# Initialize limiter. We'll set the storage backend dynamically during startup in main.py
# or we can pass a dummy redis string here, but since slowapi can take a string for redis, 
# let's just initialize it with the redis URL from config if it's available.
from app.core.config import settings

limiter = Limiter(
    key_func=get_remote_address, 
    default_limits=["200/minute"],
    storage_uri=settings.REDIS_URL
)
