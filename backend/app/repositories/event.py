import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete

from app.models.models import Event
from app.models.enums import EventStatus

class EventRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, event_id: uuid.UUID) -> Optional[Event]:
        result = await self.session.execute(select(Event).where(Event.id == event_id))
        return result.scalars().first()

    async def get_all(self) -> List[Event]:
        from app.models.models import Registration
        from sqlalchemy import func
        stmt = (
            select(Event, func.count(Registration.id).label('r_count'))
            .outerjoin(Registration, Event.id == Registration.event_id)
            .group_by(Event.id)
            .order_by(Event.created_at.desc())
        )
        result = await self.session.execute(stmt)
        rows = result.all()
        out = []
        for event, count in rows:
            event.registrations_count = count
            out.append(event)
        return out

    async def create(self, event: Event) -> Event:
        self.session.add(event)
        await self.session.commit()
        await self.session.refresh(event)
        return event

    async def update(self, event: Event) -> Event:
        self.session.add(event)
        await self.session.commit()
        await self.session.refresh(event)
        return event

    async def delete(self, event_id: uuid.UUID) -> bool:
        result = await self.session.execute(delete(Event).where(Event.id == event_id))
        await self.session.commit()
        return result.rowcount > 0
