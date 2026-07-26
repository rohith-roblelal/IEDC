import uuid
from typing import List, Optional
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.announcement import AnnouncementRepository
from app.models.models import Announcement
from app.schemas.schemas import AnnouncementCreate, AnnouncementUpdate

class AnnouncementService:
    def __init__(self, session: AsyncSession):
        self.repo = AnnouncementRepository(session)

    async def get_all_announcements(
        self, 
        page: int = 1, 
        page_size: int = 20,
        is_published: Optional[bool] = None,
        search: Optional[str] = None,
        include_expired: bool = True
    ) -> dict:
        items, total = await self.repo.get_all(
            page=page, 
            page_size=page_size,
            is_published=is_published,
            search=search,
            include_expired=include_expired
        )
        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "has_next": (page * page_size) < total
        }

    async def get_announcement(self, id_or_slug: str) -> Announcement:
        try:
            announcement_id = uuid.UUID(id_or_slug)
            announcement = await self.repo.get_by_id(announcement_id)
        except ValueError:
            announcement = await self.repo.get_by_slug(id_or_slug)
            
        if not announcement:
            raise HTTPException(status_code=404, detail="Announcement not found")
        return announcement

    def _generate_slug(self, title: str) -> str:
        import re
        slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
        return slug

    async def create_announcement(self, announcement_in: AnnouncementCreate, user_id: uuid.UUID) -> Announcement:
        data = announcement_in.model_dump()
        
        if not data.get("slug"):
            data["slug"] = self._generate_slug(data["title"])
            
        # Basic collision check
        existing = await self.repo.get_by_slug(data["slug"])
        if existing:
            data["slug"] = f"{data['slug']}-{uuid.uuid4().hex[:6]}"
            
        announcement = Announcement(**data, created_by=user_id)
        return await self.repo.create(announcement)

    async def update_announcement(self, announcement_id: uuid.UUID, announcement_in: AnnouncementUpdate) -> Announcement:
        announcement = await self.get_announcement(str(announcement_id))
        
        update_data = announcement_in.model_dump(exclude_unset=True)
        if "title" in update_data and not update_data.get("slug"):
            update_data["slug"] = self._generate_slug(update_data["title"])
            existing = await self.repo.get_by_slug(update_data["slug"])
            if existing and existing.id != announcement.id:
                update_data["slug"] = f"{update_data['slug']}-{uuid.uuid4().hex[:6]}"
                
        for field, value in update_data.items():
            setattr(announcement, field, value)
            
        return await self.repo.update(announcement)

    async def delete_announcement(self, announcement_id: uuid.UUID, user_id: uuid.UUID) -> None:
        announcement = await self.get_announcement(str(announcement_id))
        await self.repo.delete(announcement.id, user_id)
