import uuid
from typing import List
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.user import UserRepository
from app.models.models import User
from app.models.enums import Role
from app.schemas.schemas import UserCreate
from app.auth.security import get_password_hash

class UserService:
    def __init__(self, session: AsyncSession):
        self.repo = UserRepository(session)

    async def create_admin(self, user_in: UserCreate) -> User:
        existing_user = await self.repo.get_by_email(user_in.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        hashed_password = get_password_hash(user_in.password)
        user = User(
            email=user_in.email,
            hashed_password=hashed_password,
            role=Role.SUPER_ADMIN
        )
        return await self.repo.create(user)

    async def get_all_admins(self, page: int = 1, page_size: int = 20) -> dict:
        items, total = await self.repo.get_all_admins(page, page_size)
        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "has_next": (page * page_size) < total
        }

    async def delete_admin(self, user_id: uuid.UUID) -> None:
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="Admin not found")
        if user.role == Role.SUPER_ADMIN:
            raise HTTPException(status_code=403, detail="Cannot delete a Super Admin")
        
        await self.repo.delete(user_id)
