import uuid
from typing import List
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.team import TeamMemberRepository
from app.models.models import TeamMember
from app.schemas.schemas import TeamMemberCreate, TeamMemberUpdate

class TeamService:
    def __init__(self, session: AsyncSession):
        self.repo = TeamMemberRepository(session)

    async def get_all_members(self, page: int = 1, page_size: int = 20) -> dict:
        items, total = await self.repo.get_all(page=page, page_size=page_size)
        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "has_next": (page * page_size) < total
        }

    async def get_member(self, member_id: uuid.UUID) -> TeamMember:
        member = await self.repo.get_by_id(member_id)
        if not member:
            raise HTTPException(status_code=404, detail="Team member not found")
        return member

    async def create_member(self, member_in: TeamMemberCreate) -> TeamMember:
        member = TeamMember(**member_in.model_dump())
        return await self.repo.create(member)

    async def update_member(self, member_id: uuid.UUID, member_in: TeamMemberUpdate) -> TeamMember:
        member = await self.get_member(member_id)
        
        update_data = member_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(member, field, value)
            
        return await self.repo.update(member)

    async def delete_member(self, member_id: uuid.UUID) -> None:
        member = await self.get_member(member_id)
        await self.repo.delete(member_id)
