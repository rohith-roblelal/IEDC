import uuid
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.models.models import User
from app.schemas.schemas import PodcastResponse, PodcastCreate, PodcastUpdate
from app.api.dependencies import get_current_active_admin
from app.services.podcast import PodcastService

router = APIRouter()

@router.get("", response_model=List[PodcastResponse])
async def read_podcasts(db: AsyncSession = Depends(get_db)):
    """
    Retrieve all podcasts. Public endpoint.
    """
    podcast_service = PodcastService(db)
    return await podcast_service.get_all_podcasts()

@router.get("/active", response_model=PodcastResponse)
async def read_active_podcast(db: AsyncSession = Depends(get_db)):
    """
    Retrieve the currently active podcast. Public endpoint.
    """
    podcast_service = PodcastService(db)
    podcast = await podcast_service.get_active_podcast()
    if not podcast:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="No active podcast found")
    return podcast

@router.post("", response_model=PodcastResponse)
async def create_podcast(
    podcast_in: PodcastCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """
    Create a new podcast. Only accessible by Admin.
    """
    podcast_service = PodcastService(db)
    return await podcast_service.create_podcast(podcast_in)

@router.put("/{podcast_id}", response_model=PodcastResponse)
async def update_podcast(
    podcast_id: uuid.UUID,
    podcast_in: PodcastUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """
    Update a podcast. Only accessible by Admin.
    """
    podcast_service = PodcastService(db)
    return await podcast_service.update_podcast(podcast_id, podcast_in)

@router.delete("/{podcast_id}", status_code=204)
async def delete_podcast(
    podcast_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """
    Delete a podcast. Only accessible by Admin.
    """
    podcast_service = PodcastService(db)
    await podcast_service.delete_podcast(podcast_id)
