import asyncio
from app.database.session import SessionLocal
from app.models.models import TeamMember
from sqlalchemy import select

async def main():
    async with SessionLocal() as db:
        result = await db.execute(select(TeamMember))
        members = result.scalars().all()
        for m in members:
            pos = m.position.lower()
            if "nodal" in pos:
                m.category = "Faculty & Nodal Officers"
            elif m.is_lead or ("lead" in pos and "assist" not in pos):
                m.category = "Student Leadership"
            elif "assist" in pos:
                m.category = "Assistant Leads"
            elif len(m.position) <= 5:
                m.category = "Core Team"
            else:
                m.category = "Members"
            db.add(m)
        await db.commit()
        print("Updated categories for existing members.")

if __name__ == "__main__":
    asyncio.run(main())
