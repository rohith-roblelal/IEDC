import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete
from fastapi import HTTPException

from app.models.models import Podcast
from app.schemas.schemas import PodcastCreate, PodcastUpdate

class PodcastService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all_podcasts(self, page: int = 1, page_size: int = 20) -> dict:
        from app.database.pagination import paginate
        query = select(Podcast).order_by(Podcast.created_at.desc())
        items, total = await paginate(self.session, query, page, page_size)
        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "has_next": (page * page_size) < total
        }

    async def get_active_podcasts(self) -> List[Podcast]:
        result = await self.session.execute(
            select(Podcast).where(Podcast.is_active == True).order_by(Podcast.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_podcast(self, podcast_id: uuid.UUID) -> Optional[Podcast]:
        result = await self.session.execute(select(Podcast).where(Podcast.id == podcast_id))
        return result.scalars().first()

    async def create_podcast(self, podcast_in: PodcastCreate) -> Podcast:

        podcast = Podcast(**podcast_in.model_dump())
        self.session.add(podcast)
        await self.session.commit()
        await self.session.refresh(podcast)
        return podcast

    async def update_podcast(self, podcast_id: uuid.UUID, podcast_in: PodcastUpdate) -> Podcast:
        podcast = await self.get_podcast(podcast_id)
        if not podcast:
            raise HTTPException(status_code=404, detail="Podcast not found")

        update_data = podcast_in.model_dump(exclude_unset=True)
        
        

        for field, value in update_data.items():
            setattr(podcast, field, value)

        await self.session.commit()
        await self.session.refresh(podcast)
        return podcast

    async def delete_podcast(self, podcast_id: uuid.UUID) -> None:
        podcast = await self.get_podcast(podcast_id)
        if not podcast:
            raise HTTPException(status_code=404, detail="Podcast not found")
            
        await self.session.execute(delete(Podcast).where(Podcast.id == podcast_id))
        await self.session.commit()
