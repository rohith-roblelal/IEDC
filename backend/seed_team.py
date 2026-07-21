import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text, delete
from dotenv import load_dotenv

from app.models.models import TeamMember

load_dotenv('.env.local')
load_dotenv('.env')

DATABASE_URL = os.environ.get('DATABASE_URL')
engine = create_async_engine(DATABASE_URL)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

TEAM = [
    # Faculty
    {"name": "Sajitha KS", "position": "Nodal Officer", "meta": "Assistant Professor, Department of Instrumentation and Control Engineering", "is_lead": True},
    {"name": "Dr. Chithra N.V", "position": "Assistant Nodal Officer", "meta": "Head of Department Mechanical Engineering", "is_lead": True},
    # Leadership
    {"name": "Feba Josy", "position": "Student Lead I", "meta": "4th Year · ECE", "is_lead": True},
    {"name": "N Amjith Kumar", "position": "Assistant Lead II", "meta": "4rd Year · CE", "is_lead": True},
    # Core
    {"name": "Amrith Raj", "position": "CFO", "meta": "4th Year · ECE", "is_lead": False},
    {"name": "Gerom Aloshious", "position": "CMO", "meta": "4th Year · EEE", "is_lead": False},
    {"name": "Amal krishna OU", "position": "CTO", "meta": "4th Year · ECE", "is_lead": False},
    {"name": "Vasudev KS", "position": "CPO", "meta": "3rd Year · CSE", "is_lead": False},
    {"name": "Nanditha MR", "position": "WEL", "meta": "4th Year · ECE", "is_lead": False},
    {"name": "Jaims Aldrin D Cunja", "position": "COO", "meta": "4th Year · ICE", "is_lead": False},
    {"name": "Shreyas KP", "position": "IPR", "meta": "4th Year - ECE", "is_lead": False},
    {"name": " lead", "position": "CCO", "meta": " Year - Dept", "is_lead": False},
    # Assistant Leads
    {"name": "Rohith Roblelal", "position": "Assistant CTO", "meta": "2nd Year - CSE(Cyber Security)", "is_lead": False},
    {"name": "Ajay Ghosh M", "position": "Assistant CPO", "meta": "2nd Year - CSE(Artificial Intelligence)", "is_lead": False},
    {"name": "Anni Esha Ashic", "position": "Assistant WEL", "meta": "2nd Year - ICE", "is_lead": False},
    {"name": "Siva Sankar S.N", "position": "Assistant CCO", "meta": "2nd Year - ICE", "is_lead": False},
]

async def seed():
    async with AsyncSessionLocal() as session:
        # Clear existing
        await session.execute(delete(TeamMember))
        
        for member_data in TEAM:
            member = TeamMember(**member_data)
            session.add(member)
        await session.commit()
        print("Successfully re-seeded team members with meta tags!")
    await engine.dispose()

asyncio.run(seed())
