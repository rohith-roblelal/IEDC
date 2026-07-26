import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete

from app.models.models import Event, utcnow
from app.models.enums import EventStatus

class EventRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, event_id: uuid.UUID) -> Optional[Event]:
        result = await self.session.execute(select(Event).where(Event.id == event_id, Event.deleted_at.is_(None)))
        return result.scalars().first()

    async def get_by_slug(self, slug: str) -> Optional[Event]:
        result = await self.session.execute(select(Event).where(Event.slug == slug, Event.deleted_at.is_(None)))
        return result.scalars().first()

    async def get_all(self, page: int = 1, page_size: int = 20, is_published: Optional[bool] = None, category: Optional[str] = None, search: Optional[str] = None) -> tuple[List[Event], int]:
        from app.database.pagination import paginate
        from sqlalchemy import or_
        query = select(Event).where(Event.deleted_at.is_(None))
        
        if is_published is not None:
            query = query.where(Event.is_published == is_published)
            
        if category:
            query = query.where(Event.category == category)
            
        if search:
            search_pattern = f"%{search}%"
            query = query.where(
                or_(
                    Event.title.ilike(search_pattern),
                    Event.short_description.ilike(search_pattern)
                )
            )
            
        query = query.order_by(Event.created_at.desc())
        return await paginate(self.session, query, page, page_size)

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
        result = await self.session.execute(update(Event).where(Event.id == event_id).values(deleted_at=utcnow()))
        await self.session.commit()
        return result.rowcount > 0
