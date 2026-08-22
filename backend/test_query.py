import asyncio
import sys

if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from app.models.models import Event, Registration, ContactMessage, TeamMember, Startup
from app.core.config import settings

engine = create_async_engine(settings.DATABASE_URL)
SessionLocal = async_sessionmaker(bind=engine)

async def test():
    async with SessionLocal() as session:
        query = select(
            select(func.count(Event.id)).where(Event.deleted_at.is_(None)).scalar_subquery().label("total_events"),
            select(func.count(Registration.id)).join(Event, Registration.event_id == Event.id).where(Event.deleted_at.is_(None)).scalar_subquery().label("total_registrations")
        )
        try:
            result = await session.execute(query)
            row = result.first()
            print("total_events:", row.total_events)
        except Exception as e:
            print("ERROR:", repr(e))

asyncio.run(test())
