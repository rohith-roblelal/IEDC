import uuid
from typing import List, Optional
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.event import EventRepository
from app.models.models import Event
from app.schemas.schemas import EventCreate, EventUpdate

import re

def generate_slug(title: str) -> str:
    slug = title.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    return slug.strip('-')

class EventService:
    def __init__(self, session: AsyncSession):
        self.repo = EventRepository(session)

    async def get_all_events(self, page: int = 1, page_size: int = 20, is_published: Optional[bool] = None, category: Optional[str] = None, search: Optional[str] = None) -> dict:
        items, total = await self.repo.get_all(page=page, page_size=page_size, is_published=is_published, category=category, search=search)
        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "has_next": (page * page_size) < total
        }

    async def get_event(self, event_id: uuid.UUID) -> Event:
        event = await self.repo.get_by_id(event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        return event

    async def get_event_by_slug(self, slug: str) -> Event:
        event = await self.repo.get_by_slug(slug)
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        return event

    async def _ensure_unique_slug(self, slug: str, exclude_id: Optional[uuid.UUID] = None) -> str:
        base_slug = slug
        counter = 1
        while True:
            existing = await self.repo.get_by_slug(slug)
            if not existing or (exclude_id and existing.id == exclude_id):
                break
            slug = f"{base_slug}-{counter}"
            counter += 1
        return slug

    async def create_event(self, event_in: EventCreate, creator_id: Optional[uuid.UUID] = None) -> Event:
        data = event_in.model_dump()
        slug = data.get("slug")
        if not slug:
            slug = generate_slug(data["title"])
        
        data["slug"] = await self._ensure_unique_slug(slug)
        if creator_id:
            data["created_by"] = creator_id
            
        event = Event(**data)
        return await self.repo.create(event)

    async def update_event(self, event_id: uuid.UUID, event_in: EventUpdate) -> Event:
        event = await self.get_event(event_id)
        
        update_data = event_in.model_dump(exclude_unset=True)
        
        if "slug" in update_data:
            update_data["slug"] = await self._ensure_unique_slug(update_data["slug"], exclude_id=event_id)
        elif "title" in update_data and not event.slug:
            # Fallback if slug is missing for some reason
            slug = generate_slug(update_data["title"])
            update_data["slug"] = await self._ensure_unique_slug(slug, exclude_id=event_id)
            
        for field, value in update_data.items():
            setattr(event, field, value)
            
        return await self.repo.update(event)

    async def delete_event(self, event_id: uuid.UUID) -> None:
        event = await self.get_event(event_id)
        await self.repo.delete(event_id)

    async def publish_event(self, event_id: uuid.UUID) -> Event:
        event = await self.get_event(event_id)
        event.is_published = True
        return await self.repo.update(event)

    async def unpublish_event(self, event_id: uuid.UUID) -> Event:
        event = await self.get_event(event_id)
        event.is_published = False
        return await self.repo.update(event)
