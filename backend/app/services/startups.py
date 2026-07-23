from typing import List, Optional
import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException, status, UploadFile
import os
import httpx
import urllib.parse
from app.core.config import settings
from app.repositories.startups import StartupRepository
from app.schemas.startups import StartupCreate, StartupUpdate
from app.models.models import Startup

class StartupService:
    def __init__(self, db: Session):
        self.repository = StartupRepository(db)

    def get_all_startups(self, skip: int = 0, limit: int = 100) -> List[Startup]:
        return self.repository.get_all(skip, limit)

    def get_startup(self, startup_id: uuid.UUID) -> Startup:
        startup = self.repository.get_by_id(startup_id)
        if not startup:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Startup not found"
            )
        return startup

    def create_startup(self, startup_data: StartupCreate) -> Startup:
        return self.repository.create(startup_data)

    def update_startup(self, startup_id: uuid.UUID, update_data: StartupUpdate) -> Startup:
        startup = self.get_startup(startup_id)
        return self.repository.update(startup, update_data)

    def delete_startup(self, startup_id: uuid.UUID) -> None:
        startup = self.get_startup(startup_id)
        self.repository.delete(startup)
