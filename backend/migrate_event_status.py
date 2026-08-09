import asyncio
import os
import sys
from datetime import datetime, timezone

# Add the project root to python path so we can import from app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import SessionLocal
from app.models.models import Event

async def run_migration():
    async with SessionLocal() as session:
        # Load all events
        from sqlalchemy import select
        result = await session.execute(select(Event))
        events = result.scalars().all()
        
        updated_count = 0
        status_counts = {}
        
        now = datetime.now(timezone.utc)
        
        for event in events:
            # We are preserving the existing behavior one last time
            if not event.is_published:
                new_status = "DRAFT"
            else:
                # Check if completed
                if event.end_datetime and now > event.end_datetime:
                    new_status = "COMPLETED"
                else:
                    # Determine if registration is open
                    is_registration_open = False
                    if event.registration_deadline:
                        if now <= event.registration_deadline:
                            is_registration_open = True
                    elif event.start_datetime:
                        if now < event.start_datetime:
                            is_registration_open = True
                    else:
                        is_registration_open = True
            
                    if is_registration_open:
                        new_status = "REGISTRATION_OPEN"
                    elif event.start_datetime and event.end_datetime and event.start_datetime <= now <= event.end_datetime:
                        new_status = "ONGOING"
                    else:
                        new_status = "PUBLISHED"
            
            # Idempotent: only update if it is empty (from the new migration) or we want to overwrite
            if event.status != new_status:
                event.status = new_status
                updated_count += 1
                status_counts[new_status] = status_counts.get(new_status, 0) + 1
                
        # Commit the transaction
        await session.commit()
        print(f"Migration completed successfully. Updated {updated_count} events.")
        for status, count in status_counts.items():
            print(f" - {status}: {count} events")

if __name__ == "__main__":
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(run_migration())
