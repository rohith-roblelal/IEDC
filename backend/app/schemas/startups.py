import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, HttpUrl, ConfigDict, Field, field_validator

from app.models.enums import StartupStage

class TeamMemberBase(BaseModel):
    name: str
    role: str
    linkedin: Optional[str] = None

class StartupGalleryImageBase(BaseModel):
    id: uuid.UUID
    startup_id: uuid.UUID
    image_url: str
    alt_text: Optional[str] = None
    caption: Optional[str] = None
    display_order: int = 0
    is_published: bool = False
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class StartupBase(BaseModel):
    name: str
    slug: str
    short_description: str
    full_description: str
    
    logo_url: Optional[str] = None
    
    founders: Optional[List[TeamMemberBase]] = None
    team_members: Optional[List[TeamMemberBase]] = None
    
    stage: StartupStage = StartupStage.IDEA
    industry: Optional[str] = None
    
    website_url: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    demo_video_url: Optional[str] = None
    
    is_published: bool = False
    is_featured: bool = False
    
    @field_validator('founders', 'team_members', mode='before')
    @classmethod
    def parse_team_members(cls, v):
        if not v:
            return v
        if isinstance(v, list):
            parsed = []
            for item in v:
                if isinstance(item, str):
                    parsed.append({"name": item, "role": "Founder" if cls.__name__ == 'StartupBase' else "Member"})
                else:
                    parsed.append(item)
            return parsed
        return v
    
    model_config = ConfigDict(from_attributes=True)

class StartupCreate(StartupBase):
    pass

class StartupUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    short_description: Optional[str] = None
    full_description: Optional[str] = None
    
    logo_url: Optional[str] = None
    
    founders: Optional[List[TeamMemberBase]] = None
    team_members: Optional[List[TeamMemberBase]] = None
    
    stage: Optional[StartupStage] = None
    industry: Optional[str] = None
    
    website_url: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    demo_video_url: Optional[str] = None
    
    is_published: Optional[bool] = None
    is_featured: Optional[bool] = None
    
    model_config = ConfigDict(from_attributes=True)

class StartupResponse(StartupBase):
    id: uuid.UUID
    logo_url: Optional[str] = None
    gallery_images: List[StartupGalleryImageBase] = []
    
    created_at: datetime
    updated_at: datetime
