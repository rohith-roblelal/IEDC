import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete

from app.models.models import Announcement, utcnow

class AnnouncementRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, announcement_id: uuid.UUID) -> Optional[Announcement]:
        result = await self.session.execute(select(Announcement).where(Announcement.id == announcement_id, Announcement.deleted_at.is_(None)))
        return result.scalars().first()

    async def get_by_slug(self, slug: str) -> Optional[Announcement]:
        result = await self.session.execute(select(Announcement).where(Announcement.slug == slug, Announcement.deleted_at.is_(None)))
        return result.scalars().first()

    async def get_all(
        self, 
        page: int = 1, 
        page_size: int = 20,
        is_published: Optional[bool] = None,
        search: Optional[str] = None,
        include_expired: bool = True
    ) -> tuple[List[Announcement], int]:
        from app.database.pagination import paginate
        query = select(Announcement).where(Announcement.deleted_at.is_(None))

        if is_published is not None:
            query = query.where(Announcement.is_published == is_published)
            
        if search:
            query = query.where(Announcement.title.ilike(f"%{search}%"))
            
        if not include_expired:
            from sqlalchemy import or_
            query = query.where(
                or_(
                    Announcement.expires_at.is_(None),
                    Announcement.expires_at > utcnow()
                )
            )

        query = query.order_by(Announcement.is_pinned.desc(), Announcement.created_at.desc())
        return await paginate(self.session, query, page, page_size)

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

    async def delete(self, announcement_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        result = await self.session.execute(
            update(Announcement)
            .where(Announcement.id == announcement_id)
            .values(deleted_at=utcnow(), deleted_by=user_id)
        )
        await self.session.commit()
        return result.rowcount > 0
