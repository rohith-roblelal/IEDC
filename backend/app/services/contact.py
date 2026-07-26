import uuid
from typing import List
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.contact import ContactMessageRepository
from app.models.models import ContactMessage
from app.schemas.schemas import ContactMessageCreate

class ContactService:
    def __init__(self, session: AsyncSession):
        self.repo = ContactMessageRepository(session)

    async def get_all_messages(self, page: int = 1, page_size: int = 20, is_archived: bool = False) -> dict:
        items, total = await self.repo.get_all(page=page, page_size=page_size, is_archived=is_archived)
        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "has_next": (page * page_size) < total
        }

    async def get_message(self, message_id: uuid.UUID) -> ContactMessage:
        message = await self.repo.get_by_id(message_id)
        if not message:
            raise HTTPException(status_code=404, detail="Message not found")
        return message

    async def create_message(self, message_in: ContactMessageCreate) -> ContactMessage:
        message = ContactMessage(**message_in.model_dump())
        return await self.repo.create(message)

    async def mark_as_read(self, message_id: uuid.UUID) -> ContactMessage:
        message = await self.get_message(message_id)
        message.is_read = True
        return await self.repo.update(message)

    async def archive_message(self, message_id: uuid.UUID) -> ContactMessage:
        message = await self.get_message(message_id)
        message.is_archived = not message.is_archived
        return await self.repo.update(message)

    async def delete_message(self, message_id: uuid.UUID) -> None:
        message = await self.get_message(message_id)
        await self.repo.delete(message_id)

    async def reply_to_message(self, message_id: uuid.UUID, reply_text: str) -> ContactMessage:
        from app.services.email import send_reply_email
        message = await self.get_message(message_id)
        
        # Send the email
        await send_reply_email(
            to_email=message.email,
            original_message=message.message,
            reply_text=reply_text
        )
        
        # Mark as read if not already
        if not message.is_read:
            message.is_read = True
            await self.repo.update(message)
            
        return message
