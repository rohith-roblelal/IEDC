import uuid
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.models.models import User
from app.models.enums import EventStatus
from app.schemas.schemas import EventResponse, EventCreate, EventUpdate
from app.api.dependencies import get_current_active_admin
from app.services.event import EventService
from pydantic import BaseModel

class GoogleFormConnectRequest(BaseModel):
    url: str

router = APIRouter()

@router.get("", response_model=List[EventResponse])
async def read_events(db: AsyncSession = Depends(get_db)):
    """
    Retrieve all events. Public endpoint.
    """
    event_service = EventService(db)
    return await event_service.get_all_events()

@router.get("/{event_id}", response_model=EventResponse)
async def read_event(event_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """
    Retrieve a specific event. Public endpoint.
    """
    event_service = EventService(db)
    return await event_service.get_event(event_id)

@router.post("", response_model=EventResponse)
async def create_event(
    event_in: EventCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """
    Create a new event. Only accessible by Admin.
    """
    event_service = EventService(db)
    return await event_service.create_event(event_in)

@router.put("/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: uuid.UUID,
    event_in: EventUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """
    Update an event. Only accessible by Admin.
    """
    event_service = EventService(db)
    return await event_service.update_event(event_id, event_in)

@router.delete("/{event_id}", status_code=204)
async def delete_event(
    event_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """
    Delete an event. Only accessible by Admin.
    """
    event_service = EventService(db)
    await event_service.delete_event(event_id)

@router.patch("/{event_id}/open", response_model=EventResponse)
async def open_event_registration(
    event_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """
    Open registration for an event. Only accessible by Admin.
    """
    event_service = EventService(db)
    return await event_service.set_event_status(event_id, EventStatus.REGISTRATION_OPEN)

@router.patch("/{event_id}/close", response_model=EventResponse)
async def close_event_registration(
    event_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """
    Close registration for an event. Only accessible by Admin.
    """
    event_service = EventService(db)
    return await event_service.set_event_status(event_id, EventStatus.REGISTRATION_CLOSED)

@router.post("/{event_id}/google-form/connect")
async def connect_google_form(
    event_id: uuid.UUID,
    payload: GoogleFormConnectRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """
    Connects a Google Form to an event by auto-detecting fields.
    """
    from app.services.google_form import GoogleFormService
    from fastapi import HTTPException
    
    gf_service = GoogleFormService(db)
    success, form_id, mapping, response_url, err = await gf_service.auto_detect_mapping(payload.url)
    if not success:
        raise HTTPException(status_code=400, detail=err)
        
    event_service = EventService(db)
    event = await event_service.get_event(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    # Update event
    event_in = EventUpdate(
        google_form_enabled=True,
        google_form_url=payload.url,
        google_form_id=form_id,
        google_form_response_url=response_url,
        field_mapping=mapping
    )
    
    await event_service.update_event(event_id, event_in)
    
    return {"success": True, "message": "Connected successfully", "data": {"mapping": mapping}}
