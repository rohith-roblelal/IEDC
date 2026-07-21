import uuid
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.models.models import User
from app.schemas.schemas import RegistrationResponse, RegistrationCreate
from app.api.dependencies import get_current_active_admin
from app.services.registration import RegistrationService

router = APIRouter()

@router.post("/events/{event_id}/register", response_model=RegistrationResponse)
async def register_for_event(
    event_id: uuid.UUID,
    reg_in: RegistrationCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Public endpoint to register for an event.
    """
    reg_service = RegistrationService(db)
    return await reg_service.register_for_event(event_id, reg_in)

@router.get("/registrations", response_model=List[RegistrationResponse])
async def read_all_registrations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_admin)
):
    """
    Retrieve all registrations across all events. Only accessible by Admin.
    """
    reg_service = RegistrationService(db)
    return await reg_service.get_all_registrations()

@router.get("/events/{event_id}/participants", response_model=List[RegistrationResponse])
async def read_event_participants(
    event_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_admin)
):
    """
    Retrieve all participants for a specific event. Only accessible by Admin.
    """
    reg_service = RegistrationService(db)
    return await reg_service.get_event_participants(event_id)

@router.delete("/registrations/{registration_id}", status_code=204)
async def delete_registration(
    registration_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_admin)
):
    """
    Delete a registration. Only accessible by Admin.
    """
    reg_service = RegistrationService(db)
    await reg_service.delete_registration(registration_id)
