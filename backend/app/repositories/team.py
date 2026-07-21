import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete

from app.models.models import TeamMember

class TeamMemberRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, member_id: uuid.UUID) -> Optional[TeamMember]:
        result = await self.session.execute(select(TeamMember).where(TeamMember.id == member_id))
        return result.scalars().first()

    async def get_all(self) -> List[TeamMember]:
        # Typical logic is to show leads first, then ordered by creation
        result = await self.session.execute(
            select(TeamMember).order_by(TeamMember.is_lead.desc(), TeamMember.created_at.asc())
        )
        return result.scalars().all()

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
        result = await self.session.execute(delete(TeamMember).where(TeamMember.id == member_id))
        await self.session.commit()
        return result.rowcount > 0
