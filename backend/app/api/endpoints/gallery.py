from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List, Optional
import uuid

from app.database.session import get_db
from app.models.models import GalleryImage, User
from app.schemas.gallery import GalleryImageResponse, GalleryImageUpdate
from app.api.dependencies import get_current_user, get_current_super_admin, get_optional_current_user
from app.services.storage import storage_service
import logging
logger = logging.getLogger(__name__)
from app.api.cache import cache_control, ETagRoute

router = APIRouter()

@router.get("", response_model=List[GalleryImageResponse], dependencies=[Depends(cache_control(max_age=900, s_maxage=3600))])
async def get_gallery_images(
    category: Optional[str] = None,
    event_id: Optional[uuid.UUID] = None,
    is_published: Optional[bool] = None,
    limit: int = Query(100, le=100),
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Get all gallery images with optional filtering."""
    query = select(GalleryImage).where(GalleryImage.deleted_at.is_(None))
    
    # If not authenticated as super admin, only show published images
    if not current_user or current_user.role != "SUPER_ADMIN":
        query = query.where(GalleryImage.is_published == True)
    elif is_published is not None:
        query = query.where(GalleryImage.is_published == is_published)
        
    if category:
        query = query.where(GalleryImage.category == category)
        
    if event_id:
        query = query.where(GalleryImage.event_id == event_id)
        
    query = query.order_by(desc(GalleryImage.created_at)).offset(offset).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/upload", response_model=GalleryImageResponse, status_code=status.HTTP_201_CREATED)
async def upload_gallery_image(
    request: Request,
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    alt_text: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    is_published: bool = Form(False),
    event_id: Optional[uuid.UUID] = Form(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin)
):
    """Upload a new image to the gallery."""
    # 1. Upload file using StorageService
    try:
        storage_path = await storage_service.upload_file(file, folder="gallery")
        public_url = storage_service.get_public_url(storage_path)
    except Exception as e:
        logger.error(f"Failed to upload image: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload image to storage")
        
    # 2. Create database record
    new_image = GalleryImage(
        title=title,
        description=description,
        alt_text=alt_text or title or file.filename,
        category=category,
        is_published=is_published,
        event_id=event_id,
        image_url=public_url,
        storage_path=storage_path,
        uploaded_by=current_user.id
    )
    
    db.add(new_image)
    await db.commit()
    await db.refresh(new_image)
    
    # 3. Log audit action (assuming you have an audit log service or just standard logger for now)
    logger.info(f"User {current_user.email} uploaded gallery image {new_image.id}")
    
    return new_image

@router.patch("/{image_id}", response_model=GalleryImageResponse)
async def update_gallery_image(
    image_id: uuid.UUID,
    image_update: GalleryImageUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin)
):
    """Update gallery image metadata."""
    query = select(GalleryImage).where(GalleryImage.id == image_id, GalleryImage.deleted_at.is_(None))
    result = await db.execute(query)
    image = result.scalar_one_or_none()
    
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
        
    update_data = image_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(image, key, value)
        
    await db.commit()
    await db.refresh(image)
    
    logger.info(f"User {current_user.email} updated gallery image {image.id}")
    return image

@router.delete("/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_gallery_image(
    request: Request,
    image_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin)
):
    """Soft delete a gallery image and optionally remove from storage."""
    query = select(GalleryImage).where(GalleryImage.id == image_id, GalleryImage.deleted_at.is_(None))
    result = await db.execute(query)
    image = result.scalar_one_or_none()
    
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
        
    # Soft delete the database record
    from datetime import datetime, timezone
    image.deleted_at = datetime.now(timezone.utc)
    image.deleted_by = current_user.id
    
    # Optionally, we can delete the file from storage to save space, but keeping it 
    # aligns with the soft-delete philosophy. In a real system, a cron job might purge soft-deleted files.
    # For now, we will delete from storage to ensure we don't leak space since Supabase storage costs money.
    try:
        if image.storage_path:
            await storage_service.delete_file(storage_path=str(image.storage_path))
    except Exception as e:
        logger.error(f"Failed to delete file from storage: {e}")
        # Proceed with DB soft delete even if storage delete fails
        
    await db.commit()
    logger.info(f"User {current_user.email} deleted gallery image {image.id}")
    
    return None
