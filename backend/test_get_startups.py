import asyncio
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.session import SessionLocal
from app.services.startups import StartupService
from app.schemas.startups import StartupResponse
from app.schemas.schemas import PaginatedResponse

# Fix asyncio on Windows
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

async def main():
    async with SessionLocal() as db:
        service = StartupService(db)
        data = await service.get_all_startups(published_only=True)
        try:
            res = PaginatedResponse[StartupResponse](**data)
            print("Validation successful!")
        except Exception as e:
            print("Validation failed:")
            print(e)

asyncio.run(main())
