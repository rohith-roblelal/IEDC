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

    async def get_all(self, page: int = 1, page_size: int = 20, is_published: Optional[bool] = None, category: Optional[str] = None, search: Optional[str] = None, date_after: Optional[str] = None, sort: Optional[str] = None, scope: Optional[str] = None) -> tuple[List[Event], int]:
        from app.database.pagination import paginate
        from sqlalchemy import or_, and_
        query = select(Event).where(Event.deleted_at.is_(None))
        
        if is_published is not None:
            if is_published:
                query = query.where(Event.status != "DRAFT")
            else:
                query = query.where(Event.status == "DRAFT")
            
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
            
        if date_after:
            from datetime import datetime
            try:
                date_val = datetime.fromisoformat(date_after.replace('Z', '+00:00'))
                query = query.where(Event.start_datetime >= date_val)
            except ValueError:
                pass

        if scope == "upcoming":
            query = query.where(
                and_(
                    or_(
                        Event.end_datetime >= utcnow(),
                        Event.end_datetime.is_(None)
                    ),
                    Event.status != "COMPLETED",
                    Event.status != "CANCELLED"
                )
            )

        if sort == "date_asc":
            query = query.order_by(Event.start_datetime.asc())
        elif sort == "date_desc":
            query = query.order_by(Event.start_datetime.desc())
        else:
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
