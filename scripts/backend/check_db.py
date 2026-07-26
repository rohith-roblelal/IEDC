import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv(".env.test")
TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL")

async def check_db():
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        res = await conn.execute(text("SELECT tablename FROM pg_tables WHERE schemaname = 'public'"))
        tables = res.fetchall()
        print("TABLES:", [t[0] for t in tables])
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check_db())
