import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database.session import get_db
from app.models.models import User, StartupGalleryImage, Batch, Technology
from app.schemas.startups import (
    StartupPublicResponse, StartupAdminResponse, 
    StartupCreate, StartupUpdate, StartupGalleryImageBase,
    BatchResponse, TechnologyResponse
)
from app.api.dependencies import get_current_super_admin
from app.services.startups import StartupService
from app.schemas.schemas import PaginatedResponse
from app.services.storage import storage_service

from app.api.cache import cache_control, ETagRoute

router = APIRouter(route_class=ETagRoute)

# --- Dictionary Lookups ---

@router.get("/batches", response_model=List[BatchResponse], dependencies=[Depends(cache_control(max_age=900, s_maxage=3600))])
async def get_batches(db: AsyncSession = Depends(get_db)):
    """Retrieve all batches."""
    query = select(Batch).where(Batch.deleted_at.is_(None), Batch.is_active == True).order_by(Batch.display_order)
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/technologies", response_model=List[TechnologyResponse], dependencies=[Depends(cache_control(max_age=900, s_maxage=3600))])
async def get_technologies(db: AsyncSession = Depends(get_db)):
    """Retrieve all technologies."""
    query = select(Technology).where(Technology.deleted_at.is_(None)).order_by(Technology.name)
    result = await db.execute(query)
    return result.scalars().all()


# --- Public Endpoints ---

@router.get("", response_model=PaginatedResponse[StartupPublicResponse], dependencies=[Depends(cache_control(max_age=900, s_maxage=3600))])
async def get_public_startups(
    page: int = Query(1, ge=1), 
    page_size: int = Query(20, ge=1, le=100),
    featured_only: bool = Query(False),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve published startups. Public endpoint."""
    startup_service = StartupService(db)
    return await startup_service.get_all_startups(
        page=page, 
        page_size=page_size, 
        published_only=True,
        featured_only=featured_only
    )

@router.get("/{startup_id_or_slug}", response_model=StartupPublicResponse, dependencies=[Depends(cache_control(max_age=900, s_maxage=3600))])
async def get_public_startup(startup_id_or_slug: str, db: AsyncSession = Depends(get_db)):
    """Retrieve a specific published startup. Public endpoint."""
    startup_service = StartupService(db)
    return await startup_service.get_startup(startup_id_or_slug, published_only=True)

# --- Admin Dashboard Endpoints ---

@router.get("/dashboard/all", response_model=PaginatedResponse[StartupAdminResponse])
async def get_all_startups_admin(
    page: int = Query(1, ge=1), 
    page_size: int = Query(20, ge=1, le=100), 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin)
):
    """Retrieve all startups including drafts. Only accessible by Admin."""
    startup_service = StartupService(db)
    return await startup_service.get_all_startups(page=page, page_size=page_size, published_only=False)

@router.get("/dashboard/{startup_id_or_slug}", response_model=StartupAdminResponse)
async def get_startup_admin(
    startup_id_or_slug: str, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin)
):
    """Retrieve a specific startup (including draft). Only accessible by Admin."""
    startup_service = StartupService(db)
    return await startup_service.get_startup(startup_id_or_slug, published_only=False)

@router.post("", response_model=StartupAdminResponse, status_code=status.HTTP_201_CREATED)
async def create_startup(
    startup_in: StartupCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin),
):
    """Create a new startup. Only accessible by Admin."""
    startup_service = StartupService(db)
    return await startup_service.create_startup(startup_in, current_user.id)

@router.put("/{startup_id}", response_model=StartupAdminResponse)
async def update_startup(
    startup_id: uuid.UUID,
    startup_in: StartupUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin),
):
    """Update a startup. Only accessible by Admin."""
    startup_service = StartupService(db)
    return await startup_service.update_startup(startup_id, startup_in)

@router.delete("/{startup_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_startup(
    startup_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin),
):
    """Delete a startup. Only accessible by Admin."""
    startup_service = StartupService(db)
    await startup_service.delete_startup(startup_id, current_user.id)

# --- Media Upload Endpoints ---

@router.post("/{startup_id}/logo", response_model=StartupAdminResponse)
async def upload_startup_logo(
    startup_id: uuid.UUID,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin)
):
    """Upload or update a startup's logo."""
    startup_service = StartupService(db)
    startup = await startup_service.get_startup(str(startup_id))
    
    # Upload file
    storage_path = await storage_service.upload_file(file, folder=f"startups/{startup.id}/logos")
    public_url = storage_service.get_public_url(storage_path)
        
    # Update startup
    startup_in = StartupUpdate(logo_url=public_url)
    return await startup_service.update_startup(startup_id, startup_in)

@router.post("/{startup_id}/gallery", response_model=StartupGalleryImageBase, status_code=status.HTTP_201_CREATED)
async def upload_startup_gallery_image(
    startup_id: uuid.UUID,
    file: UploadFile = File(...),
    alt_text: Optional[str] = Form(None),
    caption: Optional[str] = Form(None),
    is_published: bool = Form(False),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin)
):
    """Upload a new image to the startup's gallery."""
    startup_service = StartupService(db)
    startup = await startup_service.get_startup(str(startup_id))
    
    image_id = uuid.uuid4()
    
    storage_path = await storage_service.upload_file(file, folder=f"startups/{startup_id}/gallery")
    public_url = storage_service.get_public_url(storage_path)
        
    gallery_image = StartupGalleryImage(
        id=image_id,
        startup_id=startup_id,
        image_url=public_url,
        storage_path=storage_path,
        alt_text=alt_text,
        caption=caption,
        is_published=is_published,
        uploaded_by=current_user.id
    )
    
    return await startup_service.repo.add_gallery_image(gallery_image)

@router.delete("/gallery/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_startup_gallery_image(
    image_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin)
):
    """Delete a gallery image."""
    startup_service = StartupService(db)
    image = await startup_service.repo.get_gallery_image(image_id)
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
        
    # Soft delete in database
    await startup_service.repo.delete_gallery_image(image_id, current_user.id)
