from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete

from app.models.models import User, utcnow
from app.models.enums import Role
from typing import Optional, List
import uuid

class UserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.session.execute(select(User).where(User.email == email, User.deleted_at.is_(None)))
        return result.scalars().first()

    async def get_by_id(self, user_id: uuid.UUID) -> Optional[User]:
        result = await self.session.execute(select(User).where(User.id == user_id, User.deleted_at.is_(None)))
        return result.scalars().first()

    async def get_all_admins(self, page: int = 1, page_size: int = 20) -> tuple[List[User], int]:
        from app.database.pagination import paginate
        query = select(User).where(User.role == Role.SUPER_ADMIN, User.deleted_at.is_(None)).order_by(User.created_at.desc())
        return await paginate(self.session, query, page, page_size)

    async def create(self, user: User) -> User:
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def delete(self, user_id: uuid.UUID) -> bool:
        result = await self.session.execute(update(User).where(User.id == user_id).values(deleted_at=utcnow()))
        await self.session.commit()
        return result.rowcount > 0
