import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete

from app.models.models import TeamMember, utcnow

class TeamMemberRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, member_id: uuid.UUID) -> Optional[TeamMember]:
        result = await self.session.execute(select(TeamMember).where(TeamMember.id == member_id, TeamMember.deleted_at.is_(None)))
        return result.scalars().first()

    async def get_all(self, page: int = 1, page_size: int = 100) -> tuple[List[TeamMember], int]:
        from app.database.pagination import paginate
        # Sort by display order, then by creation date
        query = (
            select(TeamMember)
            .where(TeamMember.deleted_at.is_(None))
            .order_by(TeamMember.display_order.asc(), TeamMember.created_at.asc())
        )
        return await paginate(self.session, query, page, page_size)

    async def create(self, member: TeamMember) -> TeamMember:
        self.session.add(member)
        await self.session.commit()
        await self.session.refresh(member)
        return member

    async def update(self, member: TeamMember) -> TeamMember:
        self.session.add(member)
        await self.session.commit()
        await self.session.refresh(member)
        return member

    async def delete(self, member_id: uuid.UUID) -> bool:
        result = await self.session.execute(update(TeamMember).where(TeamMember.id == member_id).values(deleted_at=utcnow()))
        await self.session.commit()
        return result.rowcount > 0
