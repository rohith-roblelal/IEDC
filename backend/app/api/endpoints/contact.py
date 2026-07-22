import uuid
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.models.models import User
from app.schemas.schemas import ContactMessageResponse, ContactMessageCreate
from app.api.dependencies import get_current_active_admin
from app.services.contact import ContactService

router = APIRouter()

@router.post("", response_model=ContactMessageResponse)
async def create_contact_message(
    message_in: ContactMessageCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Public endpoint to submit a contact message.
    """
    contact_service = ContactService(db)
    return await contact_service.create_message(message_in)

@router.get("", response_model=List[ContactMessageResponse])
async def read_contact_messages(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """
    Retrieve all contact messages. Only accessible by Admin.
    """
    contact_service = ContactService(db)
    return await contact_service.get_all_messages()

@router.patch("/{message_id}/read", response_model=ContactMessageResponse)
async def mark_message_as_read(
    message_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """
    Mark a contact message as read. Only accessible by Admin.
    """
    contact_service = ContactService(db)
    return await contact_service.mark_as_read(message_id)

@router.delete("/{message_id}", status_code=204)
async def delete_contact_message(
    message_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """
    Delete a contact message. Only accessible by Admin.
    """
    contact_service = ContactService(db)
    await contact_service.delete_message(message_id)
