import uuid
from typing import Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.database.session import get_db
from app.models.models import User, Event, Registration, ContactMessage, TeamMember, Startup
from app.api.dependencies import get_current_super_admin

router = APIRouter()

@router.get("", response_model=Dict[str, Any])
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin),
):
    """
    Retrieve aggregated statistics for the admin dashboard. Only accessible by Admin.
    """
    # Total Events (excluding deleted)
    events_result = await db.execute(select(func.count(Event.id)).where(Event.deleted_at.is_(None)))
    total_events = events_result.scalar_one()

    # Active Registrations (only for non-deleted events)
    regs_result = await db.execute(
        select(func.count(Registration.id))
        .join(Event, Registration.event_id == Event.id)
        .where(Event.deleted_at.is_(None))
    )
    total_registrations = regs_result.scalar_one()

    # Unread Messages
    unread_msg_result = await db.execute(select(func.count(ContactMessage.id)).where(ContactMessage.is_read == False))
    unread_messages = unread_msg_result.scalar_one()

    # Total Team Members (excluding deleted)
    team_result = await db.execute(select(func.count(TeamMember.id)).where(TeamMember.deleted_at.is_(None)))
    total_team_members = team_result.scalar_one()

    # Total Startups (excluding deleted)
    startups_result = await db.execute(select(func.count(Startup.id)).where(Startup.deleted_at.is_(None)))
    total_startups = startups_result.scalar_one()

    return {
        "total_events": total_events,
        "total_registrations": total_registrations,
        "unread_messages": unread_messages,
        "total_team_members": total_team_members,
        "total_startups": total_startups
    }
