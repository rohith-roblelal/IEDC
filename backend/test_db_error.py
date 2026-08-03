import asyncio
import uuid
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from app.core.config import settings
from app.services.startups import StartupService
from app.schemas.startups import StartupCreate

async def main():
    engine = create_async_engine(str(settings.DATABASE_URL))
    async_session = async_sessionmaker(engine, expire_on_commit=False)
    
    payload = {
        "name": "Ecocee 5",
        "slug": "ecocee-5",
        "tagline": "",
        "short_description": "thederhdbethrhdtbfbb",
        "full_description": "<p>some desc</p>",
        "stage": "IDEA",
        "status": "ACTIVE",
        "industry": "tech",
        "founded_year": 2025,
        "website_url": "",
        "email": "rohithroblelal9c@gmail.com",
        "phone": "",
        "linkedin_url": "",
        "is_published": False,
        "is_featured": False,
        "verification_status": "PENDING",
        "display_order": 0,
        "founders": [
            {
                "name": "John",
                "role": "",
                "department": "",
                "is_alumni": False,
                "graduation_year": None,
                "linkedin_url": ""
            }
        ],
        "awards": [],
        "funding": [],
        "press_links": [],
        "technology_ids": [],
    }
    startup_in = StartupCreate(**payload)
    
    async with async_session() as session:
        # Get a real user ID
        from sqlalchemy import text
        res = await session.execute(text("SELECT id FROM users LIMIT 1"))
        real_user_id = res.scalar()
        if not real_user_id:
            print("No users found")
            return
            
        service = StartupService(session)
        user_id = real_user_id
        try:
            created = await service.create_startup(startup_in, user_id)
            print("Created successfully:", created.id)
            
            # Validate response schema
            from app.schemas.startups import StartupAdminResponse
            response_model = StartupAdminResponse.model_validate(created)
            print("Validated successfully!")
        except Exception as e:
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    import sys
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
