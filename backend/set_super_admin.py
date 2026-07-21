import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from dotenv import load_dotenv

from app.models.models import User
from app.models.enums import Role
from app.auth.security import get_password_hash

load_dotenv('.env.local')
load_dotenv('.env')

DATABASE_URL = os.environ.get('DATABASE_URL')
engine = create_async_engine(DATABASE_URL)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

SUPER_ADMIN_EMAIL = "iedcsnmimt@gmail.com"
SUPER_ADMIN_PASSWORD = os.environ.get('FIRST_SUPERADMIN_PASSWORD', "iedcsnmimt@2026")

async def set_super_admin():
    async with AsyncSessionLocal() as session:
        # Check if user exists
        result = await session.execute(select(User).where(User.email == SUPER_ADMIN_EMAIL))
        user = result.scalars().first()
        
        if user:
            user.role = Role.SUPER_ADMIN
            user.hashed_password = get_password_hash(SUPER_ADMIN_PASSWORD)
            print(f"Updated existing user {SUPER_ADMIN_EMAIL} to SUPER_ADMIN")
        else:
            user = User(
                email=SUPER_ADMIN_EMAIL,
                hashed_password=get_password_hash(SUPER_ADMIN_PASSWORD),
                role=Role.SUPER_ADMIN
            )
            session.add(user)
            print(f"Created new SUPER_ADMIN user: {SUPER_ADMIN_EMAIL}")
            
        await session.commit()

    await engine.dispose()

asyncio.run(set_super_admin())
