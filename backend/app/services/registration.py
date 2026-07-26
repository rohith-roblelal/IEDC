import uuid
from typing import List
from datetime import datetime, timezone
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.registration import RegistrationRepository
from app.repositories.event import EventRepository
from app.models.models import Registration
from app.models.enums import EventStatus
from app.schemas.schemas import RegistrationCreate

class RegistrationService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repo = RegistrationRepository(session)
        self.event_repo = EventRepository(session)

    async def register_for_event(self, event_id: uuid.UUID, reg_in: RegistrationCreate) -> Registration:
        event = await self.event_repo.get_by_id(event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        
        # Validation 1: Check if Registration is Open
        if event.status != EventStatus.REGISTRATION_OPEN:
            raise HTTPException(status_code=400, detail="Registration is not open for this event")
            
        # Validation 2: Check Deadline
        if event.registration_deadline and datetime.now(timezone.utc) > event.registration_deadline:
            raise HTTPException(status_code=400, detail="Registration deadline has passed")
            
        # Validation 3: Check duplicates
        existing = await self.repo.get_by_event_and_email(event_id, reg_in.email)
        if existing:
            raise HTTPException(status_code=400, detail="You have already registered for this event")
            
        # Validation 4: Check Participant Limits
        if event.max_participants is not None:
            current_count = await self.repo.count_by_event(event_id)
            if current_count >= event.max_participants:
                raise HTTPException(status_code=400, detail="Registration full")
                
        # Database Sync (Save locally FIRST)
        reg = None
        if event.sync_to_database:
            reg_model = Registration(**reg_in.model_dump())
            reg_model.event_id = event_id
            reg = await self.repo.create(reg_model)
        else:
            reg = Registration(**reg_in.model_dump())
            reg.event_id = event_id
            reg.id = uuid.uuid4()

        # Google Form Integration (Do not block on failure)
        if event.google_form_enabled:
            from app.services.google_form import GoogleFormService
            gf_service = GoogleFormService(self.session)
            success = await gf_service.submit_registration(event, reg_in)
            if not success:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Failed to sync registration {reg.id} to Google Form for event {event.id}")
                # We do NOT raise an exception here because local registration succeeded.

        return reg

    async def get_all_registrations(self, page: int = 1, page_size: int = 20) -> dict:
        items, total = await self.repo.get_all(page=page, page_size=page_size)
        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "has_next": (page * page_size) < total
        }

    async def get_event_participants(self, event_id: uuid.UUID, page: int = 1, page_size: int = 20) -> dict:
        items, total = await self.repo.get_by_event(event_id, page=page, page_size=page_size)
        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "has_next": (page * page_size) < total
        }

    async def delete_registration(self, registration_id: uuid.UUID) -> None:
        reg = await self.repo.get_by_id(registration_id)
        if not reg:
            raise HTTPException(status_code=404, detail="Registration not found")
        await self.repo.delete(registration_id)
