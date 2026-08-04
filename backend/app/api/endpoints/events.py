from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
import uuid

from app.database.session import get_db
from app.models.models import User
from app.schemas.schemas import EventResponse, EventCreate, EventUpdate, PaginatedResponse
from app.api.dependencies import get_current_super_admin
from app.services.event import EventService
from app.core.rate_limit import limiter

from app.api.cache import cache_control, ETagRoute

class GoogleFormConnectRequest(BaseModel):
    url: str

router = APIRouter(route_class=ETagRoute)

@router.get("", response_model=PaginatedResponse[EventResponse], dependencies=[Depends(cache_control(max_age=300, s_maxage=900))])
async def read_events(
    page: int = Query(1, ge=1), 
    page_size: int = Query(20, ge=1, le=100),
    is_published: Optional[bool] = Query(None),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve all events. Public endpoint.
    """
    event_service = EventService(db)
    return await event_service.get_all_events(
        page=page, 
        page_size=page_size, 
        is_published=is_published, 
        category=category, 
        search=search
    )

@router.get("/{slug}", response_model=EventResponse, dependencies=[Depends(cache_control(max_age=300, s_maxage=900))])
async def read_event(slug: str, db: AsyncSession = Depends(get_db)):
    """
    Retrieve a specific event by slug. Public endpoint.
    """
    event_service = EventService(db)
    # Check if slug is a UUID (in case dashboard calls by ID)
    try:
        event_id = uuid.UUID(slug)
        return await event_service.get_event(event_id)
    except ValueError:
        return await event_service.get_event_by_slug(slug)

@router.post("", response_model=EventResponse)
async def create_event(
    event_in: EventCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin),
):
    """
    Create a new event. Only accessible by Super Admin.
    """
    event_service = EventService(db)
    return await event_service.create_event(event_in, creator_id=current_user.id)

@router.put("/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: uuid.UUID,
    event_in: EventUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin),
):
    """
    Update an event. Only accessible by Super Admin.
    """
    event_service = EventService(db)
    return await event_service.update_event(event_id, event_in)

@router.delete("/{event_id}", status_code=204)
async def delete_event(
    event_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin),
):
    """
    Delete an event. Only accessible by Super Admin.
    """
    event_service = EventService(db)
    await event_service.delete_event(event_id)

@router.patch("/{event_id}/publish", response_model=EventResponse)
async def publish_event(
    event_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin),
):
    """
    Publish an event. Only accessible by Super Admin.
    """
    event_service = EventService(db)
    return await event_service.publish_event(event_id)

@router.patch("/{event_id}/unpublish", response_model=EventResponse)
async def unpublish_event(
    event_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin),
):
    """
    Unpublish an event. Only accessible by Super Admin.
    """
    event_service = EventService(db)
    return await event_service.unpublish_event(event_id)

@router.post("/{event_id}/google-form/connect")
@limiter.limit("5/minute")
async def connect_google_form(
    request: Request,
    event_id: uuid.UUID,
    payload: GoogleFormConnectRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin),
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
