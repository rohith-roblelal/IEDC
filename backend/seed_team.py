import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text, delete
from dotenv import load_dotenv

from app.models.models import TeamMember
from app.models.enums import TeamCategory

load_dotenv('.env.local')
load_dotenv('.env')

DATABASE_URL = os.environ.get('DATABASE_URL')
engine = create_async_engine(DATABASE_URL)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

TEAM = [
    # Faculty
    {"name": "Sajitha KS", "role_title": "Nodal Officer", "department": "Instrumentation and Control Engineering", "category": TeamCategory.NODAL_OFFICER, "display_order": 1},
    {"name": "Dr. Chithra N.V", "role_title": "Assistant Nodal Officer", "department": "Mechanical Engineering", "category": TeamCategory.ASSISTANT_NODAL_OFFICER, "display_order": 1},
    
    # Leadership
    {"name": "Feba Josy", "role_title": "Student Lead I", "department": "ECE", "year": "4th Year", "category": TeamCategory.STUDENT_LEADERSHIP, "display_order": 1},
    {"name": "N Amjith Kumar", "role_title": "Assistant Lead II", "department": "CE", "year": "4th Year", "category": TeamCategory.STUDENT_LEADERSHIP, "display_order": 2},
    
    # Core
    {"name": "Amrith Raj", "role_title": "CFO", "department": "ECE", "year": "4th Year", "category": TeamCategory.CORE_TEAM, "display_order": 1},
    {"name": "Gerom Aloshious", "role_title": "CMO", "department": "EEE", "year": "4th Year", "category": TeamCategory.CORE_TEAM, "display_order": 2},
    {"name": "Amal krishna OU", "role_title": "CTO", "department": "ECE", "year": "4th Year", "category": TeamCategory.CORE_TEAM, "display_order": 3},
    {"name": "Vasudev KS", "role_title": "CPO", "department": "CSE", "year": "3rd Year", "category": TeamCategory.CORE_TEAM, "display_order": 4},
    {"name": "Nanditha MR", "role_title": "WEL", "department": "ECE", "year": "4th Year", "category": TeamCategory.CORE_TEAM, "display_order": 5},
    {"name": "Jaims Aldrin D Cunja", "role_title": "COO", "department": "ICE", "year": "4th Year", "category": TeamCategory.CORE_TEAM, "display_order": 6},
    {"name": "Shreyas KP", "role_title": "IPR", "department": "ECE", "year": "4th Year", "category": TeamCategory.CORE_TEAM, "display_order": 7},
    {"name": "lead", "role_title": "CCO", "department": "Dept", "year": "Year", "category": TeamCategory.CORE_TEAM, "display_order": 8},
    
    # Assistant Leads
    {"name": "Rohith Roblelal", "role_title": "Assistant CTO", "department": "CSE(Cyber Security)", "year": "2nd Year", "category": TeamCategory.ASSISTANT_LEADS, "display_order": 1},
    {"name": "Ajay Ghosh M", "role_title": "Assistant CPO", "department": "CSE(Artificial Intelligence)", "year": "2nd Year", "category": TeamCategory.ASSISTANT_LEADS, "display_order": 2},
    {"name": "Anni Esha Ashic", "role_title": "Assistant WEL", "department": "ICE", "year": "2nd Year", "category": TeamCategory.ASSISTANT_LEADS, "display_order": 3},
    {"name": "Siva Sankar S.N", "role_title": "Assistant CCO", "department": "ICE", "year": "2nd Year", "category": TeamCategory.ASSISTANT_LEADS, "display_order": 4},
]

async def seed():
    async with AsyncSessionLocal() as session:
        # Clear existing
        await session.execute(delete(TeamMember))
        
        for member_data in TEAM:
            member = TeamMember(**member_data)
            session.add(member)
        await session.commit()
        print("Successfully re-seeded team members with updated schema!")
    await engine.dispose()

import sys
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

if __name__ == "__main__":
    asyncio.run(seed())
