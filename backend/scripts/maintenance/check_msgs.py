import asyncio
import sys
import os

if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.database.session import SessionLocal
from app.models.models import ContactMessage
from sqlalchemy import select

async def main():
    async with SessionLocal() as db:
        result = await db.execute(select(ContactMessage))
        messages = result.scalars().all()
        print(f"Count: {len(messages)}")
        for m in messages:
            print(f"- {m.name}: {m.message} (Read: {m.is_read})")

asyncio.run(main())

asyncio.run(main())
