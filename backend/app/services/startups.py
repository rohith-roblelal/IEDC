import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from sqlalchemy.future import select

from app.repositories.startups import StartupRepository
from app.schemas.startups import StartupCreate, StartupUpdate
from app.models.models import (
    Startup, StartupGalleryImage, Technology, 
    StartupFounder, StartupAward, StartupFunding, StartupPressLink
)

class StartupService:
    def __init__(self, session: AsyncSession):
        self.session = session
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

    async def _fetch_technologies(self, tech_ids: List[uuid.UUID]) -> List[Technology]:
        if not tech_ids:
            return []
        query = select(Technology).where(Technology.id.in_(tech_ids))
        result = await self.session.execute(query)
        techs = result.scalars().all()
        if len(techs) != len(tech_ids):
            raise HTTPException(status_code=400, detail="One or more technologies not found")
        return list(techs)

    async def create_startup(self, startup_in: StartupCreate, user_id: uuid.UUID) -> Startup:
        # Check if slug exists
        existing = await self.repo.get_by_slug(startup_in.slug)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Startup with this slug already exists"
            )
            
        # Check if name exists
        existing_name = await self.repo.get_by_name(startup_in.name)
        if existing_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Startup with this name already exists"
            )
            
        # Exclude nested lists from main dict
        startup_data = startup_in.model_dump(exclude={"founders", "awards", "funding", "press_links", "technology_ids"})
        startup = Startup(**startup_data, created_by=user_id)
        
        if startup_in.technology_ids:
            startup.technologies = await self._fetch_technologies(startup_in.technology_ids)
            
        # Add nested relationships
        startup.founders = [StartupFounder(**f.model_dump()) for f in startup_in.founders]
        startup.awards = [StartupAward(**a.model_dump()) for a in startup_in.awards]
        startup.funding = [StartupFunding(**f.model_dump()) for f in startup_in.funding]
        startup.press_links = [StartupPressLink(**p.model_dump()) for p in startup_in.press_links]

        # Use repo inside transaction
        try:
            created_startup = await self.repo.create(startup)
            await self.session.commit()
            return await self.get_startup(str(created_startup.id))
        except Exception as e:
            await self.session.rollback()
            raise HTTPException(status_code=500, detail=str(e))

    async def update_startup(self, startup_id: uuid.UUID, startup_in: StartupUpdate) -> Startup:
        startup = await self.get_startup(str(startup_id))
        
        if startup_in.slug and startup_in.slug != startup.slug:
            existing = await self.repo.get_by_slug(startup_in.slug)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Startup with this slug already exists"
                )
                
        if startup_in.name and startup_in.name != startup.name:
            existing_name = await self.repo.get_by_name(startup_in.name)
            if existing_name:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Startup with this name already exists"
                )
        
        update_data = startup_in.model_dump(exclude_unset=True, exclude={"founders", "awards", "funding", "press_links", "technology_ids"})
        
        # Check conditional logic requirement: if status = closed, hide featured option
        if (update_data.get("status") == "CLOSED" or (startup.status == "CLOSED" and "status" not in update_data)) and update_data.get("is_featured"):
            raise HTTPException(status_code=400, detail="Closed startups cannot be featured.")

        for field, value in update_data.items():
            setattr(startup, field, value)
            
        # Update nested collections if provided
        if startup_in.technology_ids is not None:
            startup.technologies = await self._fetch_technologies(startup_in.technology_ids)
            
        if startup_in.founders is not None:
            # Simple replace: this deletes old ones and creates new ones
            startup.founders = [StartupFounder(**f.model_dump()) for f in startup_in.founders]
            
        if startup_in.awards is not None:
            startup.awards = [StartupAward(**a.model_dump()) for a in startup_in.awards]
            
        if startup_in.funding is not None:
            startup.funding = [StartupFunding(**f.model_dump()) for f in startup_in.funding]
            
        if startup_in.press_links is not None:
            startup.press_links = [StartupPressLink(**p.model_dump()) for p in startup_in.press_links]

        try:
            updated_startup = await self.repo.update(startup)
            await self.session.commit()
            return await self.get_startup(str(updated_startup.id))
        except Exception as e:
            await self.session.rollback()
            raise HTTPException(status_code=500, detail=str(e))

    async def delete_startup(self, startup_id: uuid.UUID, user_id: uuid.UUID) -> None:
        startup = await self.get_startup(str(startup_id))
        try:
            await self.repo.delete(startup_id, user_id)
            await self.session.commit()
        except Exception as e:
            await self.session.rollback()
            raise HTTPException(status_code=500, detail=str(e))
