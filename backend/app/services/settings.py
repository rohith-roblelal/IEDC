from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import UploadFile

from app.repositories.settings import SettingsRepository
from app.models.models import WebsiteSettings
from app.schemas.settings import WebsiteSettingsUpdate


class SettingsService:
    def __init__(self, session: AsyncSession):
        self.repo = SettingsRepository(session)

    async def get_settings(self) -> WebsiteSettings:
        return await self.repo.get_or_create()

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
        }
        folder = folder_map.get(field, "settings/misc")
        storage_path = await storage_service.upload_file(file, folder=folder)
        public_url = storage_service.get_public_url(storage_path)
        return await self.repo.update({field: public_url})
