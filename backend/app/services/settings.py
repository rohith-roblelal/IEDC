from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import UploadFile

from app.repositories.settings import SettingsRepository
from app.models.models import WebsiteSettings, Event, Startup, Partner
from app.schemas.settings import WebsiteSettingsUpdate
from sqlalchemy import select, func


class SettingsService:
    def __init__(self, session: AsyncSession):
        self.repo = SettingsRepository(session)

    async def get_settings(self) -> WebsiteSettings:
        settings = await self.repo.get_or_create()
        
        # Calculate derived impact statistics
        session = self.repo.session
        events_count = await session.scalar(select(func.count(Event.id)).where(Event.is_published == True, Event.deleted_at.is_(None)))
        projects_count = await session.scalar(select(func.count(Startup.id)).where(Startup.is_published == True, Startup.deleted_at.is_(None)))
        workshops_count = await session.scalar(select(func.count(Event.id)).where(Event.is_published == True, Event.deleted_at.is_(None), Event.category == "WORKSHOP"))
        partners_count = await session.scalar(select(func.count(Partner.id)))

        settings.derived_stats = {
            "events": events_count or 0,
            "projects": projects_count or 0,
            "workshops": workshops_count or 0,
            "partners": partners_count or 0
        }
        return settings

    async def update_settings(self, data: WebsiteSettingsUpdate) -> WebsiteSettings:
        update_data = data.model_dump(exclude_none=True)
        # Serialize nested models (about_stats_json)
        if "about_stats_json" in update_data and update_data["about_stats_json"]:
            update_data["about_stats_json"] = [
                item if isinstance(item, dict) else item.model_dump()
                for item in update_data["about_stats_json"]
            ]
        return await self.repo.update(update_data)

    async def upload_image(self, field: str, file: UploadFile) -> WebsiteSettings:
        from app.services.storage import storage_service
        folder_map = {
            "logo_url": "settings/logo",
            "favicon_url": "settings/favicon",
            "hero_image_url": "settings/hero",
            "og_image_url": "settings/og",
            "about_inspiration_image_url": "settings/about"
        }
        folder = folder_map.get(field, "settings/misc")
        storage_path = await storage_service.upload_file(file, folder=folder)
        public_url = storage_service.get_public_url(storage_path)
        return await self.repo.update({field: public_url})
