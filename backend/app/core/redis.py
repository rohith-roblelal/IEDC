from redis.asyncio import Redis, ConnectionPool
from app.core.config import settings

redis_pool = None

def get_redis_pool() -> ConnectionPool:
    """Get or create the global Redis connection pool."""
    global redis_pool
    if redis_pool is None:
        redis_pool = ConnectionPool.from_url(
            settings.REDIS_URL,
            max_connections=settings.REDIS_MAX_CONNECTIONS,
            socket_timeout=settings.REDIS_SOCKET_TIMEOUT,
            health_check_interval=settings.REDIS_HEALTH_CHECK_INTERVAL,
            decode_responses=True
        )
    return redis_pool

def get_redis_client() -> Redis:
    """Get a Redis client from the global pool."""
    return Redis(connection_pool=get_redis_pool())

async def close_redis():
    """Close the global Redis pool."""
    global redis_pool
    if redis_pool is not None:
        await redis_pool.disconnect()
        redis_pool = None
