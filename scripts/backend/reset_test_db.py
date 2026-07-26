import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import sys

if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

async def main():
    engine = create_async_engine(
        'postgresql+asyncpg://neondb_owner:npg_lRc2PEGCW4Tt@ep-bold-art-azbp3e1z-pooler.c-3.ap-southeast-1.aws.neon.tech/iedc_test?ssl=require',
        isolation_level='AUTOCOMMIT'
    )
    async with engine.connect() as conn:
        try:
            await conn.execute(text('DROP SCHEMA IF EXISTS public CASCADE'))
            await conn.execute(text('CREATE SCHEMA public'))
            await conn.execute(text('GRANT ALL ON SCHEMA public TO public'))
            print('Schema reset successfully')
        except Exception as e:
            print(f'Error: {e}')

if __name__ == '__main__':
    asyncio.run(main())
