import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete

from app.models.models import Announcement

class AnnouncementRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, announcement_id: uuid.UUID) -> Optional[Announcement]:
        result = await self.session.execute(select(Announcement).where(Announcement.id == announcement_id))
        return result.scalars().first()

    async def get_all(self) -> List[Announcement]:
        # Sort by pinned first, then by most recent
        result = await self.session.execute(
            select(Announcement).order_by(Announcement.is_pinned.desc(), Announcement.created_at.desc())
        )
        return result.scalars().all()

    async def create(self, announcement: Announcement) -> Announcement:
        self.session.add(announcement)
        await self.session.commit()
        await self.session.refresh(announcement)
        return announcement

    async def update(self, announcement: Announcement) -> Announcement:
        self.session.add(announcement)
        await self.session.commit()
        await self.session.refresh(announcement)
        return announcement

    async def delete(self, announcement_id: uuid.UUID) -> bool:
        result = await self.session.execute(delete(Announcement).where(Announcement.id == announcement_id))
        await self.session.commit()
        return result.rowcount > 0
