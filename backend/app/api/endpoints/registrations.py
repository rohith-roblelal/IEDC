import uuid
from typing import List
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.models.models import User
from app.schemas.schemas import RegistrationResponse, RegistrationCreate, PaginatedResponse
from app.api.dependencies import get_current_super_admin
from app.services.audit import log_audit_event
from fastapi import Request
from app.services.registration import RegistrationService
from app.api.middleware.turnstile import verify_bot_token
from app.core.rate_limit import limiter

router = APIRouter()

@router.post("/events/{event_id}/register", response_model=RegistrationResponse)
@limiter.limit("10/minute")
async def register_for_event(
    request: Request,
    event_id: uuid.UUID,
    reg_in: RegistrationCreate,
    db: AsyncSession = Depends(get_db),
    _bot: bool = Depends(verify_bot_token)
):
    """
    Public endpoint to register for an event.
    """
    reg_service = RegistrationService(db)
    return await reg_service.register_for_event(event_id, reg_in)

from fastapi import APIRouter, Depends, Query
from app.schemas.schemas import PaginatedResponse

@router.get("/registrations", response_model=PaginatedResponse[RegistrationResponse])
async def read_all_registrations(
    page: int = Query(1, ge=1), 
    page_size: int = Query(20, ge=1, le=100), 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin)
):
    """
    Retrieve all registrations across all events. Only accessible by Admin.
    """
    reg_service = RegistrationService(db)
    return await reg_service.get_all_registrations(page=page, page_size=page_size)

@router.get("/events/{event_id}/participants", response_model=PaginatedResponse[RegistrationResponse])
async def read_event_participants(
    event_id: uuid.UUID,
    page: int = Query(1, ge=1), 
    page_size: int = Query(20, ge=1, le=100), 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin)
):
    """
    Retrieve all participants for a specific event. Only accessible by Admin.
    """
    reg_service = RegistrationService(db)
    return await reg_service.get_event_participants(event_id, page=page, page_size=page_size)

@router.delete("/registrations/{registration_id}", status_code=204)
async def delete_registration(
    request: Request,
    registration_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin)
):
    """
    Delete a registration. Only accessible by Admin.
    """
    reg_service = RegistrationService(db)
    await reg_service.delete_registration(registration_id)
