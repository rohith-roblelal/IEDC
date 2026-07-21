import uuid
from typing import List
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.announcement import AnnouncementRepository
from app.models.models import Announcement
from app.schemas.schemas import AnnouncementCreate, AnnouncementUpdate

class AnnouncementService:
    def __init__(self, session: AsyncSession):
        self.repo = AnnouncementRepository(session)

    async def get_all_announcements(self) -> List[Announcement]:
        return await self.repo.get_all()

    async def get_announcement(self, announcement_id: uuid.UUID) -> Announcement:
        announcement = await self.repo.get_by_id(announcement_id)
        if not announcement:
            raise HTTPException(status_code=404, detail="Announcement not found")
        return announcement

    async def create_announcement(self, announcement_in: AnnouncementCreate) -> Announcement:
        announcement = Announcement(**announcement_in.model_dump())
        return await self.repo.create(announcement)

    async def update_announcement(self, announcement_id: uuid.UUID, announcement_in: AnnouncementUpdate) -> Announcement:
        announcement = await self.get_announcement(announcement_id)
        
        update_data = announcement_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(announcement, field, value)
            
        return await self.repo.update(announcement)

    async def delete_announcement(self, announcement_id: uuid.UUID) -> None:
        announcement = await self.get_announcement(announcement_id)
        await self.repo.delete(announcement_id)
