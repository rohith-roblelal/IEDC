import uuid
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.models.models import User
from app.schemas.schemas import UserResponse, UserCreate
from app.api.dependencies import get_current_active_super_admin
from app.services.user import UserService

router = APIRouter()

@router.post("", response_model=UserResponse)
async def create_admin(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_super_admin),
):
    """
    Create a new admin user. Only accessible by Super Admin.
    """
    user_service = UserService(db)
    return await user_service.create_admin(user_in)

@router.get("", response_model=List[UserResponse])
async def read_admins(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_super_admin),
):
    """
    Retrieve all admin users. Only accessible by Super Admin.
    """
    user_service = UserService(db)
    return await user_service.get_all_admins()

@router.delete("/{user_id}", status_code=204)
async def delete_admin(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_super_admin),
):
    """
    Delete an admin user. Only accessible by Super Admin.
    """
    user_service = UserService(db)
    await user_service.delete_admin(user_id)
