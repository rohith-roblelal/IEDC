import asyncio
from arq.connections import RedisSettings
from app.core.config import settings
from app.services.email import email_service
import structlog
import os
import signal

logger = structlog.get_logger("worker")

async def startup(ctx):
    logger.info("worker_started")

async def shutdown(ctx):
    logger.info("worker_stopped")

async def handle_password_reset_email(ctx, to_email: str, reset_token: str):
    """
    ARQ task to send a password reset email asynchronously.
    """
    logger.info("email_job_started", to_email=to_email, job_type="password_reset")
    await email_service.send_password_reset_email(to_email, reset_token)
    logger.info("email_job_completed", to_email=to_email, job_type="password_reset")

class WorkerSettings:
    # Use standard Redis URL parsing from our config
    redis_settings = RedisSettings.from_dsn(settings.REDIS_URL)
    
    functions = [handle_password_reset_email]
    
    # Run these on startup/shutdown
    on_startup = startup
    on_shutdown = shutdown
    
    # Retry policy
    max_tries = 3
    job_timeout = 60
    
    # Graceful shutdown settings
    allow_abort_jobs = True
    job_completion_wait = 10
