import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete

from app.models.models import ContactMessage

class ContactMessageRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, message_id: uuid.UUID) -> Optional[ContactMessage]:
        result = await self.session.execute(select(ContactMessage).where(ContactMessage.id == message_id))
        return result.scalars().first()

    async def get_all(self) -> List[ContactMessage]:
        # Unread messages first, then by date descending
        result = await self.session.execute(
            select(ContactMessage).order_by(ContactMessage.is_read.asc(), ContactMessage.created_at.desc())
        )
        return result.scalars().all()

    async def create(self, message: ContactMessage) -> ContactMessage:
        self.session.add(message)
        await self.session.commit()
        await self.session.refresh(message)
        return message

    async def update(self, message: ContactMessage) -> ContactMessage:
        self.session.add(message)
        await self.session.commit()
        await self.session.refresh(message)
        return message

    async def delete(self, message_id: uuid.UUID) -> bool:
        result = await self.session.execute(delete(ContactMessage).where(ContactMessage.id == message_id))
        await self.session.commit()
        return result.rowcount > 0
