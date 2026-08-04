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
    Deep check. Attempts basic SQL SELECT 1, pings Redis, and checks Supabase storage connectivity.
    Returns 200 only if all infrastructure dependencies are available.
    """
    health_status = {
        "status": "ok",
        "database": "disconnected",
        "redis": "disconnected",
        "supabase": "disconnected"
    }
    
    is_ready = True
    
    # 1. Check Database
    try:
        await db.execute(text("SELECT 1"))
        health_status["database"] = "connected"
    except Exception as e:
        logger.error("readiness_db_failed", error=str(e))
        is_ready = False
        
    # 2. Check Redis
    try:
        redis_client = Redis(connection_pool=get_redis_pool())
        if await redis_client.ping():
            health_status["redis"] = "connected"
        else:
            is_ready = False
    except Exception as e:
        logger.error("readiness_redis_failed", error=str(e))
        is_ready = False
        
    # 3. Check Supabase
    try:
        # A simple list buckets to see if Supabase API is reachable
        res = supabase_client.storage.list_buckets()
        if res is not None:
            health_status["supabase"] = "connected"
        else:
            is_ready = False
    except Exception as e:
        logger.error("readiness_supabase_failed", error=str(e))
        is_ready = False
        
    if not is_ready:
        health_status["status"] = "error"
        return JSONResponse(status_code=503, content=health_status)
        
    return health_status
