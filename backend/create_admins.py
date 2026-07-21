import asyncio
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from app.core.config import settings
from app.models.models import User
from app.models.enums import Role
from app.auth.security import get_password_hash
from sqlalchemy.future import select

async def create_admin(email, password, role=Role.ADMIN):
    engine = create_async_engine(str(settings.DATABASE_URL))
    async_session = async_sessionmaker(engine, expire_on_commit=False)
    
    async with async_session() as session:
        result = await session.execute(select(User).where(User.email == email))
        user = result.scalars().first()
        
        if user:
            print(f"User {email} already exists. Updating password and role...")
            user.hashed_password = get_password_hash(password)
            user.role = role
            session.add(user)
        else:
            print(f"Creating new {role} user: {email}...")
            user = User(
                email=email,
                hashed_password=get_password_hash(password),
                role=role
            )
            session.add(user)
            
        await session.commit()
        print(f"Success! {email} can now login.")

if __name__ == "__main__":
    print("=== Create Student Lead Admins ===")
    asyncio.run(create_admin("studentlead1@snmimt.edu.in", "studentlead123", Role.ADMIN))
    asyncio.run(create_admin("studentlead2@snmimt.edu.in", "studentlead123", Role.ADMIN))
