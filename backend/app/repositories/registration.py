import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete

from app.models.models import Registration

class RegistrationRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, registration_id: uuid.UUID) -> Optional[Registration]:
        result = await self.session.execute(select(Registration).where(Registration.id == registration_id))
        return result.scalars().first()

    async def get_by_event_and_email(self, event_id: uuid.UUID, email: str) -> Optional[Registration]:
        result = await self.session.execute(
            select(Registration).where(
                Registration.event_id == event_id,
                Registration.email == email
            )
        )
        return result.scalars().first()

    async def count_by_event(self, event_id: uuid.UUID) -> int:
        # A simple count approach for now
        result = await self.session.execute(select(Registration).where(Registration.event_id == event_id))
        return len(result.scalars().all())

    async def get_all(self) -> List[Registration]:
        result = await self.session.execute(select(Registration).order_by(Registration.created_at.desc()))
        return result.scalars().all()

    async def get_by_event(self, event_id: uuid.UUID) -> List[Registration]:
        result = await self.session.execute(
            select(Registration).where(Registration.event_id == event_id).order_by(Registration.created_at.desc())
        )
        return result.scalars().all()

    async def create(self, registration: Registration) -> Registration:
        self.session.add(registration)
        await self.session.commit()
        await self.session.refresh(registration)
        return registration

    async def delete(self, registration_id: uuid.UUID) -> bool:
        result = await self.session.execute(delete(Registration).where(Registration.id == registration_id))
        await self.session.commit()
        return result.rowcount > 0
