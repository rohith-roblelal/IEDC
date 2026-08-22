import sys
from sqlalchemy import select, func
from sqlalchemy.dialects import postgresql
from app.models.models import Event, Registration, ContactMessage, TeamMember, Startup

query = select(
    select(func.count(Event.id)).where(Event.deleted_at.is_(None)).scalar_subquery().label("total_events"),
    select(func.count(Registration.id)).join(Event, Registration.event_id == Event.id).where(Event.deleted_at.is_(None)).scalar_subquery().label("total_registrations"),
    select(func.count(ContactMessage.id)).where(ContactMessage.is_read == False).scalar_subquery().label("unread_messages"),
    select(func.count(TeamMember.id)).where(TeamMember.deleted_at.is_(None)).scalar_subquery().label("total_team_members"),
    select(func.count(Startup.id)).where(Startup.deleted_at.is_(None)).scalar_subquery().label("total_startups")
)

print(query.compile(dialect=postgresql.dialect(), compile_kwargs={"literal_binds": True}))
