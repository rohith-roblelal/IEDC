import asyncio
import httpx
import structlog
import os
import subprocess

logger = structlog.get_logger("chaos_destructive")

def docker_compose_stop(service: str):
    subprocess.run(["docker-compose", "stop", service], check=True)

def docker_compose_start(service: str):
    subprocess.run(["docker-compose", "start", service], check=True)

async def test_db_outage():
    logger.warning("Initiating Database Outage")
    docker_compose_stop("db")
    
    # Let the connection pool realize it's gone
    await asyncio.sleep(2)
    
    try:
        async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
            res = await client.get("/api/v1/health")
            logger.info(f"Health endpoint response during DB outage: {res.status_code}")
            # Note: We expect the app to handle this gracefully (e.g., 503 Service Unavailable or 500)
            # but NOT to crash the main Uvicorn process.
    finally:
        logger.info("Restoring Database")
        docker_compose_start("db")
        await asyncio.sleep(5)

if __name__ == "__main__":
    # Ensure this is only run on local/game day environments!
    if os.environ.get("ENVIRONMENT") == "production":
        logger.error("Destructive tests cannot run in production!")
        exit(1)
        
    asyncio.run(test_db_outage())
