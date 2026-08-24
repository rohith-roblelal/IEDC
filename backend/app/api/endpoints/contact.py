import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.models.models import User
from app.schemas.schemas import ContactMessageResponse, ContactMessageCreate, PaginatedResponse
from app.api.dependencies import get_current_super_admin
from app.services.audit import log_audit_event
from fastapi import Request
from app.core.rate_limit import limiter
from app.api.middleware.turnstile import verify_bot_token
from app.services.contact import ContactService

router = APIRouter()

@router.post("", response_model=ContactMessageResponse)
@limiter.limit("5/minute")
async def create_contact_message(
    request: Request,
    message_in: ContactMessageCreate,
    db: AsyncSession = Depends(get_db),
    _bot: bool = Depends(verify_bot_token)
):
    """
    Public endpoint to submit a contact message.
    """
    contact_service = ContactService(db)
    return await contact_service.create_message(message_in)

from fastapi import APIRouter, Depends, Query
from app.schemas.schemas import PaginatedResponse

@router.get("", response_model=PaginatedResponse[ContactMessageResponse])
async def read_contact_messages(
    page: int = Query(1, ge=1), 
    page_size: int = Query(20, ge=1, le=100),
    is_archived: bool = Query(False),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin),
):
    """
    Retrieve all contact messages. Only accessible by Admin.
    """
    contact_service = ContactService(db)
    return await contact_service.get_all_messages(page=page, page_size=page_size, is_archived=is_archived)

@router.patch("/{message_id}/read", response_model=ContactMessageResponse)
async def mark_message_as_read(
    request: Request,
    message_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin),
):
    """
    Mark a contact message as read. Only accessible by Admin.
    """
    contact_service = ContactService(db)
    obj = await contact_service.mark_as_read(message_id)
    await log_audit_event(db, "contact.mark_read", user_id=current_user.id, resource_type="contact", resource_id=str(obj.id), ip_address=request.client.host if request.client else None)
    return obj

@router.patch("/{message_id}/archive", response_model=ContactMessageResponse)
async def archive_message(
    request: Request,
    message_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin),
):
    """
    Toggle archive status of a contact message. Only accessible by Admin.
    """
    contact_service = ContactService(db)
    obj = await contact_service.archive_message(message_id)
    await log_audit_event(db, "contact.archive", user_id=current_user.id, resource_type="contact", resource_id=str(obj.id), ip_address=request.client.host if request.client else None)
    return obj

@router.delete("/{message_id}", status_code=204)
async def delete_contact_message(
    request: Request,
    message_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin),
):
    """
    Delete a contact message. Only accessible by Admin.
    """
    contact_service = ContactService(db)
    await contact_service.delete_message(message_id)
    await log_audit_event(db, "contact.delete", user_id=current_user.id, resource_type="contact", resource_id=str(message_id), ip_address=request.client.host if request.client else None)


