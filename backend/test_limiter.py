from slowapi import Limiter
from slowapi.util import get_remote_address

try:
    limiter = Limiter(
        key_func=get_remote_address, 
        default_limits=["200/minute"],
        storage_uri="redis://localhost:6379/0",
        swallow_errors=True,
        in_memory_fallback_enabled=True,
        in_memory_fallback=["200/minute"]
    )
    print("Limiter initialized successfully")
except Exception as e:
    print("Limiter error:", repr(e))
