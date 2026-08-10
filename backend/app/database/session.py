from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.core.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
    pool_size=5,
    max_overflow=10,
    pool_recycle=1800,
    pool_pre_ping=True,
    pool_timeout=30,
)

from sqlalchemy import event
import time
import structlog

db_logger = structlog.get_logger("database")

@event.listens_for(engine.sync_engine, "before_cursor_execute")
def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    conn.info.setdefault("query_start_time", []).append(time.perf_counter())

@event.listens_for(engine.sync_engine, "after_cursor_execute")
def after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    total = time.perf_counter() - conn.info["query_start_time"].pop(-1)
    duration_ms = int(total * 1000)
    
    statement_upper = statement.lstrip().upper()
    operation = statement_upper.split()[0] if statement_upper else "UNKNOWN"
    
    if duration_ms > 100:
        db_logger.warning("database_query_slow", query_time=duration_ms, operation=operation, slow_query=True)
    else:
        db_logger.debug("database_query", query_time=duration_ms, operation=operation)

SessionLocal = async_sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()

async def get_db():
    async with SessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
