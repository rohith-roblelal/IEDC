import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete

from app.models.models import Gallery

class GalleryRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, gallery_id: uuid.UUID) -> Optional[Gallery]:
        result = await self.session.execute(select(Gallery).where(Gallery.id == gallery_id))
        return result.scalars().first()

    async def get_all(self) -> List[Gallery]:
        result = await self.session.execute(select(Gallery).order_by(Gallery.created_at.desc()))
        return result.scalars().all()

    async def get_by_event(self, event_id: uuid.UUID) -> List[Gallery]:
        result = await self.session.execute(
            select(Gallery).where(Gallery.event_id == event_id).order_by(Gallery.created_at.desc())
        )
        return result.scalars().all()

    async def create(self, gallery_item: Gallery) -> Gallery:
        self.session.add(gallery_item)
        await self.session.commit()
        await self.session.refresh(gallery_item)
        return gallery_item

    async def delete(self, gallery_id: uuid.UUID) -> bool:
        result = await self.session.execute(delete(Gallery).where(Gallery.id == gallery_id))
        await self.session.commit()
        return result.rowcount > 0
