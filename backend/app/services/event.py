import uuid
from typing import List
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.event import EventRepository
from app.models.models import Event
from app.models.enums import EventStatus
from app.schemas.schemas import EventCreate, EventUpdate

class EventService:
    def __init__(self, session: AsyncSession):
        self.repo = EventRepository(session)

    async def get_all_events(self) -> List[Event]:
        return await self.repo.get_all()

    async def get_event(self, event_id: uuid.UUID) -> Event:
        event = await self.repo.get_by_id(event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        return event

    async def create_event(self, event_in: EventCreate) -> Event:
        event = Event(**event_in.model_dump())
        return await self.repo.create(event)

    async def update_event(self, event_id: uuid.UUID, event_in: EventUpdate) -> Event:
        event = await self.get_event(event_id)
        
        update_data = event_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(event, field, value)
            
        return await self.repo.update(event)

    async def delete_event(self, event_id: uuid.UUID) -> None:
        event = await self.get_event(event_id)
        await self.repo.delete(event_id)

    async def set_event_status(self, event_id: uuid.UUID, status: EventStatus) -> Event:
        event = await self.get_event(event_id)
        event.status = status
        return await self.repo.update(event)
