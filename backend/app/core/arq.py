from arq import create_pool
from arq.connections import RedisSettings
from app.core.config import settings
from fastapi import FastAPI
import structlog

logger = structlog.get_logger("arq")

arq_pool = None

async def init_arq_pool(app: FastAPI):
    global arq_pool
    try:
        redis_settings = RedisSettings.from_dsn(settings.REDIS_URL)
        arq_pool = await create_pool(redis_settings)
        app.state.arq_pool = arq_pool
        logger.info("arq_pool_initialized")
    except Exception as e:
        logger.error("arq_pool_initialization_failed", error=str(e))
        if settings.ENVIRONMENT != "development":
            raise

async def close_arq_pool():
    global arq_pool
    if arq_pool:
        await arq_pool.close()
        arq_pool = None
        logger.info("arq_pool_closed")

def get_arq_pool():
    return arq_pool
