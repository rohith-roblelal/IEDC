from typing import List, Optional
import uuid
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.models import Startup
from app.schemas.startups import StartupCreate, StartupUpdate

class StartupRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Startup]:
        return self.db.query(Startup).order_by(desc(Startup.created_at)).offset(skip).limit(limit).all()

    def get_by_id(self, startup_id: uuid.UUID) -> Optional[Startup]:
        return self.db.query(Startup).filter(Startup.id == startup_id).first()

    def create(self, startup_data: StartupCreate) -> Startup:
        db_startup = Startup(**startup_data.model_dump())
        self.db.add(db_startup)
        self.db.commit()
        self.db.refresh(db_startup)
        return db_startup

    def update(self, db_startup: Startup, update_data: StartupUpdate) -> Startup:
        update_dict = update_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(db_startup, key, value)
        
        self.db.commit()
        self.db.refresh(db_startup)
        return db_startup

    def delete(self, db_startup: Startup) -> None:
        self.db.delete(db_startup)
        self.db.commit()
