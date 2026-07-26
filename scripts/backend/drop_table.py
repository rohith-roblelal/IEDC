import asyncio, os, sys
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv
load_dotenv('.env.local')
load_dotenv('.env')
engine = create_async_engine(os.environ.get('DATABASE_URL'))
async def run():
    async with engine.begin() as conn:
        await conn.execute(text('DROP TABLE IF EXISTS team_members CASCADE;'))
        await conn.execute(text('DROP TYPE IF EXISTS teamcategory CASCADE;'))
    await engine.dispose()
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
asyncio.run(run())
