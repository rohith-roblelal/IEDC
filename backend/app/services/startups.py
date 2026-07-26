import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.repositories.startups import StartupRepository
from app.schemas.startups import StartupCreate, StartupUpdate
from app.models.models import Startup, StartupGalleryImage

class StartupService:
    def __init__(self, session: AsyncSession):
        self.repo = StartupRepository(session)

    async def get_all_startups(self, page: int = 1, page_size: int = 20, published_only: bool = False, featured_only: bool = False) -> dict:
        items, total = await self.repo.get_all(page=page, page_size=page_size, published_only=published_only, featured_only=featured_only)
        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "has_next": (page * page_size) < total
        }

    async def get_startup(self, startup_id_or_slug: str, published_only: bool = False) -> Startup:
        try:
            startup_id = uuid.UUID(startup_id_or_slug)
            startup = await self.repo.get_by_id(startup_id)
        except ValueError:
            startup = await self.repo.get_by_slug(startup_id_or_slug)
            
        if not startup or (published_only and not startup.is_published):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Startup not found"
            )
        return startup

    async def create_startup(self, startup_in: StartupCreate) -> Startup:
        # Check if slug exists
        existing = await self.repo.get_by_slug(startup_in.slug)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Startup with this slug already exists"
            )
            
        startup = Startup(**startup_in.model_dump())
        return await self.repo.create(startup)

    async def update_startup(self, startup_id: uuid.UUID, startup_in: StartupUpdate) -> Startup:
        startup = await self.get_startup(str(startup_id))
        
        if startup_in.slug and startup_in.slug != startup.slug:
            existing = await self.repo.get_by_slug(startup_in.slug)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Startup with this slug already exists"
                )
        
        update_data = startup_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(startup, field, value)
            
        return await self.repo.update(startup)

    async def delete_startup(self, startup_id: uuid.UUID, user_id: uuid.UUID) -> None:
        startup = await self.get_startup(str(startup_id))
        await self.repo.delete(startup_id, user_id)
