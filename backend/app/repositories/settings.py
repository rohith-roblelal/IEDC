from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.models import WebsiteSettings


class SettingsRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_or_create(self) -> WebsiteSettings:
        result = await self.session.execute(select(WebsiteSettings).where(WebsiteSettings.id == 1))
        settings = result.scalars().first()
        if not settings:
            settings = WebsiteSettings(id=1, site_name="IEDC SNMIMT")
            self.session.add(settings)
            await self.session.commit()
            await self.session.refresh(settings)
        return settings

    async def update(self, data: dict) -> WebsiteSettings:
        settings = await self.get_or_create()
        for key, value in data.items():
            if value is not None:
                setattr(settings, key, value)
        self.session.add(settings)
        await self.session.commit()
        await self.session.refresh(settings)
        return settings
