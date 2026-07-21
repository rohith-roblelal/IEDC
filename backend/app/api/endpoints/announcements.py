import uuid
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.models.models import User
from app.schemas.schemas import AnnouncementResponse, AnnouncementCreate, AnnouncementUpdate
from app.api.dependencies import get_current_active_admin
from app.services.announcement import AnnouncementService

router = APIRouter()

@router.get("/", response_model=List[AnnouncementResponse])
async def read_announcements(db: AsyncSession = Depends(get_db)):
    """
    Retrieve all announcements. Public endpoint.
    """
    announcement_service = AnnouncementService(db)
    return await announcement_service.get_all_announcements()

@router.post("/", response_model=AnnouncementResponse)
async def create_announcement(
    announcement_in: AnnouncementCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """
    Create a new announcement. Only accessible by Admin.
    """
    announcement_service = AnnouncementService(db)
    return await announcement_service.create_announcement(announcement_in)

@router.put("/{announcement_id}", response_model=AnnouncementResponse)
async def update_announcement(
    announcement_id: uuid.UUID,
    announcement_in: AnnouncementUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """
    Update an announcement. Only accessible by Admin.
    """
    announcement_service = AnnouncementService(db)
    return await announcement_service.update_announcement(announcement_id, announcement_in)

@router.delete("/{announcement_id}", status_code=204)
async def delete_announcement(
    announcement_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """
    Delete an announcement. Only accessible by Admin.
    """
    announcement_service = AnnouncementService(db)
    await announcement_service.delete_announcement(announcement_id)
