import uuid
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.models.models import User
from app.schemas.schemas import PodcastResponse, PodcastCreate, PodcastUpdate
from app.api.dependencies import get_current_super_admin
from app.services.podcast import PodcastService

from app.api.cache import cache_control, ETagRoute

router = APIRouter(route_class=ETagRoute)

from fastapi import APIRouter, Depends, Query
from app.schemas.schemas import PaginatedResponse

@router.get("", response_model=PaginatedResponse[PodcastResponse], dependencies=[Depends(cache_control(max_age=3600, s_maxage=21600))])
async def read_podcasts(
    page: int = Query(1, ge=1), 
    page_size: int = Query(20, ge=1, le=100), 
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve all podcasts. Public endpoint.
    """
    podcast_service = PodcastService(db)
    return await podcast_service.get_all_podcasts(page=page, page_size=page_size)

@router.get("/active", response_model=List[PodcastResponse], dependencies=[Depends(cache_control(max_age=3600, s_maxage=21600))])
async def read_active_podcasts(db: AsyncSession = Depends(get_db)):
    """
    Retrieve the currently active podcasts. Public endpoint.
    """
    podcast_service = PodcastService(db)
    podcasts = await podcast_service.get_active_podcasts()
    return podcasts

@router.post("", response_model=PodcastResponse)
async def create_podcast(
    podcast_in: PodcastCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin),
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
    current_user: User = Depends(get_current_super_admin),
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
    current_user: User = Depends(get_current_super_admin),
):
    """
    Delete a podcast. Only accessible by Admin.
    """
    podcast_service = PodcastService(db)
    await podcast_service.delete_podcast(podcast_id)
