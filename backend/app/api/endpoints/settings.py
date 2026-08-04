from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Literal

from app.database.session import get_db
from app.models.models import User
from app.schemas.settings import WebsiteSettingsResponse, WebsiteSettingsUpdate
from app.api.dependencies import get_current_super_admin
from app.services.settings import SettingsService

from app.api.cache import cache_control, ETagRoute

router = APIRouter(route_class=ETagRoute)


@router.get("", response_model=WebsiteSettingsResponse, dependencies=[Depends(cache_control(max_age=3600, s_maxage=86400))])
async def get_settings(db: AsyncSession = Depends(get_db)):
    """Public endpoint — returns website configuration."""
    service = SettingsService(db)
    return await service.get_settings()


@router.patch("", response_model=WebsiteSettingsResponse)
async def update_settings(
    data: WebsiteSettingsUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin),
):
    """Update website settings. Super Admin only."""
    service = SettingsService(db)
    return await service.update_settings(data)


@router.post("/logo", response_model=WebsiteSettingsResponse)
async def upload_logo(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin),
):
    """Upload site logo. Super Admin only."""
    service = SettingsService(db)
    return await service.upload_image("logo_url", file)


@router.post("/favicon", response_model=WebsiteSettingsResponse)
async def upload_favicon(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin),
):
    """Upload site favicon. Super Admin only."""
    service = SettingsService(db)
    return await service.upload_image("favicon_url", file)


@router.post("/hero-image", response_model=WebsiteSettingsResponse)
async def upload_hero_image(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin),
):
    """Upload hero banner image. Super Admin only."""
    service = SettingsService(db)
    return await service.upload_image("hero_image_url", file)


@router.post("/og-image", response_model=WebsiteSettingsResponse)
async def upload_og_image(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin),
):
    """Upload Open Graph image. Super Admin only."""
    service = SettingsService(db)
    return await service.upload_image("og_image_url", file)
