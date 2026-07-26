import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import sys

# Windows workaround for asyncio
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

async def main():
    # Connect to default neondb with AUTOCOMMIT for CREATE DATABASE
    engine = create_async_engine(
        'postgresql+asyncpg://neondb_owner:npg_lRc2PEGCW4Tt@ep-bold-art-azbp3e1z-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?ssl=require',
        isolation_level='AUTOCOMMIT'
    )
    async with engine.connect() as conn:
        try:
            await conn.execute(text('CREATE DATABASE iedc_test'))
            print('Database created successfully')
        except Exception as e:
            print(f'Error: {e}')

if __name__ == '__main__':
    asyncio.run(main())
