import asyncio
import logging
from sqlalchemy import select

from app.core.config import settings
from app.database.session import SessionLocal
from app.models.models import User
from app.models.enums import Role
from app.auth.security import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def seed_super_admin():
    async with SessionLocal() as db:
        logger.info("Checking for existing SUPER_ADMIN...")
        result = await db.execute(select(User).where(User.role == Role.SUPER_ADMIN))
        super_admin = result.scalars().first()

        if super_admin:
            logger.info("A SUPER_ADMIN already exists. Skipping seeding.")
            return

        logger.info("Creating the first SUPER_ADMIN...")
        
        # Values from user instruction
        email = "nodaloffer@snmimt.edu.in"
        password = settings.FIRST_SUPERADMIN_PASSWORD

        hashed_password = get_password_hash(password)
        
        new_super_admin = User(
            email=email,
            hashed_password=hashed_password,
            role=Role.SUPER_ADMIN
        )
        
        db.add(new_super_admin)
        await db.commit()
        await db.refresh(new_super_admin)
        logger.info(f"SUPER_ADMIN created successfully with email: {email}")

import sys
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

if __name__ == "__main__":
    asyncio.run(seed_super_admin())
