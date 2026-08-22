import asyncio
import sys

if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from sqlalchemy import text
from app.database.session import engine
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def set_statement_timeout():
    try:
        async with engine.connect() as conn:
            # First get the current user
            result = await conn.execute(text("SELECT current_user;"))
            current_user = result.scalar()
            
            if current_user:
                logger.info(f"Setting statement_timeout for role: {current_user}")
                # Set a 15-second statement timeout for the role
                await conn.execute(text(f"ALTER ROLE {current_user} SET statement_timeout = '15s';"))
                await conn.commit()
                logger.info("Successfully set statement_timeout to 15s")
            else:
                logger.error("Could not determine current user")
    except Exception as e:
        logger.error(f"Failed to set statement_timeout: {e}")

if __name__ == "__main__":
    asyncio.run(set_statement_timeout())
