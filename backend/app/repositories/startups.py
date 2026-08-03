import uuid
import re
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete
from sqlalchemy.orm import selectinload

from app.models.models import (
    Startup, StartupGalleryImage, Batch, Technology,
    StartupFounder, StartupAward, StartupFunding, StartupPressLink, utcnow
)
from app.schemas.startups import StartupCreate, StartupUpdate

class StartupRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    def _generate_slug(self, name: str) -> str:
        slug = name.lower()
        slug = re.sub(r'[^a-z0-9\s-]', '', slug)
        slug = re.sub(r'[\s-]+', '-', slug).strip('-')
        return slug

    async def get_by_id(self, startup_id: uuid.UUID) -> Optional[Startup]:
        query = select(Startup).options(
            selectinload(Startup.batch),
            selectinload(Startup.gallery_images),
            selectinload(Startup.founders),
            selectinload(Startup.awards),
            selectinload(Startup.funding),
            selectinload(Startup.press_links),
            selectinload(Startup.technologies)
        ).where(Startup.id == startup_id, Startup.deleted_at.is_(None))
        result = await self.session.execute(query)
        return result.scalars().first()

    async def get_by_slug(self, slug: str) -> Optional[Startup]:
        query = select(Startup).options(
            selectinload(Startup.batch),
            selectinload(Startup.gallery_images),
            selectinload(Startup.founders),
            selectinload(Startup.awards),
            selectinload(Startup.funding),
            selectinload(Startup.press_links),
            selectinload(Startup.technologies)
        ).where(Startup.slug == slug, Startup.deleted_at.is_(None))
        result = await self.session.execute(query)
        return result.scalars().first()

    async def get_by_name(self, name: str) -> Optional[Startup]:
        query = select(Startup).where(Startup.name == name, Startup.deleted_at.is_(None))
        result = await self.session.execute(query)
        return result.scalars().first()

    async def get_all(self, page: int = 1, page_size: int = 20, published_only: bool = False, featured_only: bool = False) -> tuple[List[Startup], int]:
        from app.database.pagination import paginate
        query = select(Startup).options(
            selectinload(Startup.batch),
            selectinload(Startup.gallery_images),
            selectinload(Startup.founders),
            selectinload(Startup.awards),
            selectinload(Startup.funding),
            selectinload(Startup.press_links),
            selectinload(Startup.technologies)
        ).where(Startup.deleted_at.is_(None))
        
        if published_only:
            query = query.where(Startup.is_published == True)
        if featured_only:
            query = query.where(Startup.is_featured == True)
            
        # Order by featured first, then newest
        query = query.order_by(Startup.is_featured.desc(), Startup.created_at.desc())
        
        return await paginate(self.session, query, page, page_size)

    async def create(self, startup: Startup) -> Startup:
        if not startup.slug:
            startup.slug = self._generate_slug(startup.name)
            
        self.session.add(startup)
        await self.session.flush() # flush to get startup.id
        return startup

    async def update(self, startup: Startup) -> Startup:
        self.session.add(startup)
        return startup

    async def delete(self, startup_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        result = await self.session.execute(
            update(Startup).where(Startup.id == startup_id).values(deleted_at=utcnow(), deleted_by=user_id)
        )
        return result.rowcount > 0

    # --- Gallery Methods ---
    
    async def add_gallery_image(self, image: StartupGalleryImage) -> StartupGalleryImage:
        self.session.add(image)
        await self.session.commit()
        await self.session.refresh(image)
        return image
        
    async def get_gallery_image(self, image_id: uuid.UUID) -> Optional[StartupGalleryImage]:
        result = await self.session.execute(select(StartupGalleryImage).where(StartupGalleryImage.id == image_id, StartupGalleryImage.deleted_at.is_(None)))
        return result.scalars().first()
        
    async def delete_gallery_image(self, image_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        result = await self.session.execute(
            update(StartupGalleryImage).where(StartupGalleryImage.id == image_id).values(deleted_at=utcnow(), deleted_by=user_id)
        )
        await self.session.commit()
        return result.rowcount > 0
