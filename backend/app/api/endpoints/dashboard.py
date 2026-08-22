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
    # Consolidate into a single query using scalar_subquery to prevent DB pool starvation
    query = select(
        select(func.count(Event.id)).where(Event.deleted_at.is_(None)).scalar_subquery().label("total_events"),
        select(func.count(Registration.id)).join(Event, Registration.event_id == Event.id).where(Event.deleted_at.is_(None)).scalar_subquery().label("total_registrations"),
        select(func.count(ContactMessage.id)).where(ContactMessage.is_read == False).scalar_subquery().label("unread_messages"),
        select(func.count(TeamMember.id)).where(TeamMember.deleted_at.is_(None)).scalar_subquery().label("total_team_members"),
        select(func.count(Startup.id)).where(Startup.deleted_at.is_(None)).scalar_subquery().label("total_startups")
    )
    
    result = await db.execute(query)
    row = result.first()

    return {
        "total_events": row.total_events if row else 0,
        "total_registrations": row.total_registrations if row else 0,
        "unread_messages": row.unread_messages if row else 0,
        "total_team_members": row.total_team_members if row else 0,
        "total_startups": row.total_startups if row else 0
    }
