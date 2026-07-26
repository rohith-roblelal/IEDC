import uuid
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.models.models import User
from app.schemas.schemas import TeamMemberResponse, TeamMemberCreate, TeamMemberUpdate
from app.api.dependencies import get_current_super_admin
from app.services.team import TeamService

router = APIRouter()

from fastapi import APIRouter, Depends, Query
from app.schemas.schemas import PaginatedResponse

@router.get("", response_model=PaginatedResponse[TeamMemberResponse])
async def read_team_members(
    page: int = Query(1, ge=1), 
    page_size: int = Query(20, ge=1, le=100), 
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve all team members. Public endpoint.
    """
    team_service = TeamService(db)
    return await team_service.get_all_members(page=page, page_size=page_size)

@router.post("", response_model=TeamMemberResponse)
async def create_team_member(
    member_in: TeamMemberCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin),
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
    current_user: User = Depends(get_current_super_admin),
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
    current_user: User = Depends(get_current_super_admin),
):
    """
    Delete a team member. Only accessible by Admin.
    """
    team_service = TeamService(db)
    await team_service.delete_member(member_id)

from fastapi import UploadFile, File
from app.services.storage import StorageService

@router.post("/{member_id}/photo", response_model=TeamMemberResponse)
async def upload_team_member_photo(
    member_id: uuid.UUID,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin),
):
    """
    Upload a photo for a team member.
    """
    team_service = TeamService(db)
    member = await team_service.get_member(member_id)
    
    storage = StorageService()
    url, path = await storage.upload_file(file, folder=f"team/{member_id}")
    
    update_data = TeamMemberUpdate(photo_url=url)
    return await team_service.update_member(member_id, update_data)
