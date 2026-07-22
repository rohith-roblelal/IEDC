import uuid
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.models.models import User
from app.schemas.schemas import TeamMemberResponse, TeamMemberCreate, TeamMemberUpdate
from app.api.dependencies import get_current_active_admin
from app.services.team import TeamService

router = APIRouter()

@router.get("", response_model=List[TeamMemberResponse])
async def read_team_members(db: AsyncSession = Depends(get_db)):
    """
    Retrieve all team members. Public endpoint.
    """
    team_service = TeamService(db)
    return await team_service.get_all_members()

@router.post("", response_model=TeamMemberResponse)
async def create_team_member(
    member_in: TeamMemberCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """
    Create a new team member. Only accessible by Admin.
    """
    team_service = TeamService(db)
    return await team_service.create_member(member_in)

@router.put("/{member_id}", response_model=TeamMemberResponse)
async def update_team_member(
    member_id: uuid.UUID,
    member_in: TeamMemberUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """
    Update a team member. Only accessible by Admin.
    """
    team_service = TeamService(db)
    return await team_service.update_member(member_id, member_in)

@router.delete("/{member_id}", status_code=204)
async def delete_team_member(
    member_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """
    Delete a team member. Only accessible by Admin.
    """
    team_service = TeamService(db)
    await team_service.delete_member(member_id)
