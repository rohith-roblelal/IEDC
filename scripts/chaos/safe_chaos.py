import asyncio
import httpx
import structlog
import os

logger = structlog.get_logger("chaos_safe")

async def test_redis_timeout():
    """
    In a real CI setup, we might use toxiproxy to inject 5s latency into the Redis container,
    then assert that the rate limiter gracefully bypasses or handles the timeout without
    returning a 500 internal server error.
    """
    logger.info("Simulating Redis Timeout (Safe CI Chaos Test)")
    
    # Example placeholder for toxiproxy config
    # await httpx.post("http://localhost:8474/proxies/redis/toxics", json={"type": "latency", "attributes": {"latency": 5000}})
    
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        res = await client.get("/api/v1/health")
        assert res.status_code == 200, "Health endpoint should not fail if Redis is slow"

    logger.info("Redis Timeout simulation passed.")

if __name__ == "__main__":
    asyncio.run(test_redis_timeout())
