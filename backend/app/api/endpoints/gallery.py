import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.models.models import User
from app.schemas.schemas import GalleryResponse
from app.api.dependencies import get_current_active_admin
from app.services.gallery import GalleryService

router = APIRouter()

@router.get("/", response_model=List[GalleryResponse])
async def read_gallery(db: AsyncSession = Depends(get_db)):
    """
    Retrieve all images. Public endpoint.
    """
    gallery_service = GalleryService(db)
    return await gallery_service.get_all_images()

@router.get("/event/{event_id}", response_model=List[GalleryResponse])
async def read_event_gallery(event_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """
    Retrieve images for a specific event. Public endpoint.
    """
    gallery_service = GalleryService(db)
    return await gallery_service.get_event_images(event_id)

@router.post("/upload", response_model=GalleryResponse)
async def upload_image(
    file: UploadFile = File(...),
    folder: str = Form("general"),
    event_id: Optional[uuid.UUID] = Form(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """
    Upload a new image to Supabase Storage and save to DB. Only accessible by Admin.
    """
    gallery_service = GalleryService(db)
    return await gallery_service.upload_image(file, folder, event_id)

@router.delete("/{gallery_id}", status_code=204)
async def delete_image(
    gallery_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """
    Delete an image from DB and Supabase Storage. Only accessible by Admin.
    """
    gallery_service = GalleryService(db)
    await gallery_service.delete_image(gallery_id)
