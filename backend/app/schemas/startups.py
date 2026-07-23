from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime
import uuid
from app.models.enums import StartupStatus

class StartupBase(BaseModel):
    name: str
    description: str
    founder: Optional[str] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None
    industry: Optional[str] = None
    status: StartupStatus = StartupStatus.ACTIVE

class StartupCreate(StartupBase):
    pass

class StartupUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    founder: Optional[str] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None
    industry: Optional[str] = None
    status: Optional[StartupStatus] = None

class StartupResponse(StartupBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
