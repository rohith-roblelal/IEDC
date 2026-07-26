import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import sys

if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

async def main():
    engine = create_async_engine('postgresql+asyncpg://neondb_owner:npg_lRc2PEGCW4Tt@ep-bold-art-azbp3e1z-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?ssl=require')
    async with engine.connect() as conn:
        try:
            res = await conn.execute(text('SELECT count(*) FROM events'))
            print('Events count:', res.scalar())
        except Exception as e:
            print('Error:', e)

if __name__ == '__main__':
    asyncio.run(main())
