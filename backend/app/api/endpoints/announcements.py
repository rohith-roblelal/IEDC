import uuid
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.models.models import User
from app.schemas.schemas import AnnouncementResponse, AnnouncementCreate, AnnouncementUpdate, AnnouncementPublish
from app.api.dependencies import get_current_super_admin
from app.services.announcement import AnnouncementService

router = APIRouter()

from fastapi import APIRouter, Depends, Query
from app.schemas.schemas import PaginatedResponse

@router.get("", response_model=PaginatedResponse[AnnouncementResponse])
async def read_announcements(
    page: int = Query(1, ge=1), 
    page_size: int = Query(20, ge=1, le=100),
    is_published: bool | None = Query(None),
    search: str | None = Query(None),
    include_expired: bool = Query(False),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve all announcements. Public endpoint.
    """
    announcement_service = AnnouncementService(db)
    return await announcement_service.get_all_announcements(
        page=page, 
        page_size=page_size,
        is_published=is_published,
        search=search,
        include_expired=include_expired
    )

@router.get("/{slug}", response_model=AnnouncementResponse)
async def read_announcement(slug: str, db: AsyncSession = Depends(get_db)):
    """
    Retrieve a specific announcement by slug or ID. Public endpoint.
    """
    announcement_service = AnnouncementService(db)
    return await announcement_service.get_announcement(slug)

@router.post("", response_model=AnnouncementResponse)
async def create_announcement(
    announcement_in: AnnouncementCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin),
):
    """
    Create a new announcement. Only accessible by Admin.
    """
    announcement_service = AnnouncementService(db)
    return await announcement_service.create_announcement(announcement_in, current_user.id)

@router.put("/{announcement_id}", response_model=AnnouncementResponse)
async def update_announcement(
    announcement_id: uuid.UUID,
    announcement_in: AnnouncementUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin),
):
    """
    Update an announcement. Only accessible by Admin.
    """
    announcement_service = AnnouncementService(db)
    return await announcement_service.update_announcement(announcement_id, announcement_in)

@router.patch("/{announcement_id}/publish", response_model=AnnouncementResponse)
async def publish_announcement(
    announcement_id: uuid.UUID,
    publish_data: AnnouncementPublish,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin),
):
    """
    Toggle publish status of an announcement. Only accessible by Admin.
    """
    announcement_service = AnnouncementService(db)
    update_data = AnnouncementUpdate(is_published=publish_data.is_published)
    return await announcement_service.update_announcement(announcement_id, update_data)

@router.delete("/{announcement_id}", status_code=204)
async def delete_announcement(
    announcement_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin),
):
    """
    Delete an announcement. Only accessible by Admin.
    """
    announcement_service = AnnouncementService(db)
    await announcement_service.delete_announcement(announcement_id, current_user.id)
