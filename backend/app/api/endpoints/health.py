from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.database.session import get_db, engine
from app.core.redis import get_redis_pool
from app.core.supabase import supabase_client
from redis.asyncio import Redis
import structlog

logger = structlog.get_logger("health")
router = APIRouter()

@router.get("/health")
def health_check():
    """Fast, shallow check indicating the FastAPI process is alive."""
    return {"status": "ok"}

@router.get("/ready")
async def readiness_check(db: AsyncSession = Depends(get_db)):
    """
    Ready check. Attempts basic SQL SELECT 1.
    Returns 200 only if PostgreSQL is available.
    """
    try:
        await db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        logger.error("readiness_db_failed", error=str(e))
        return JSONResponse(status_code=503, content={"status": "error", "database": "disconnected"})

@router.get("/health/dependencies")
async def dependencies_check(db: AsyncSession = Depends(get_db)):
    """
    Detailed dependency state.
    Checks PostgreSQL, Redis, ARQ, and Supabase.
    """
    health_status = {
        "status": "ok",
        "database": "unhealthy",
        "redis": "unhealthy",
        "arq": "unhealthy",
        "supabase": "unhealthy"
    }
    
    # 1. Check Database
    try:
        await db.execute(text("SELECT 1"))
        health_status["database"] = "healthy"
    except Exception as e:
        logger.error("dependencies_db_failed", error=str(e))
        health_status["status"] = "degraded"
        
    # 2. Check Redis
    try:
        redis_client = Redis(connection_pool=get_redis_pool())
        if await redis_client.ping():
            health_status["redis"] = "healthy"
        else:
            health_status["status"] = "degraded"
    except Exception as e:
        logger.error("dependencies_redis_failed", error=str(e))
        health_status["status"] = "degraded"

    # 3. Check ARQ (same underlying Redis pool in our case, but logically separate)
    from app.core.arq import get_arq_pool
    if get_arq_pool():
        health_status["arq"] = "healthy"
    else:
        health_status["status"] = "degraded"
        
    # 4. Check Supabase
    try:
        res = supabase_client.storage.list_buckets()
        if res is not None:
            health_status["supabase"] = "healthy"
        else:
            health_status["status"] = "degraded"
    except Exception as e:
        logger.error("dependencies_supabase_failed", error=str(e))
        health_status["status"] = "degraded"
        
    # We still return 200 if it's degraded, so orchestration doesn't kill the pod, 
    # but internal monitoring can see it's degraded.
    # If the database is unhealthy, we return 503 since the app is effectively broken.
    if health_status["database"] == "unhealthy":
        return JSONResponse(status_code=503, content=health_status)
        
    return health_status
