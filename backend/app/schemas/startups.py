import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, HttpUrl, ConfigDict, Field

from app.models.enums import StartupStage, StartupStatus, StartupRegistrationStatus

# --- Dictionary Lookups ---

class BatchBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True
    display_order: int = 0

class BatchResponse(BatchBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class TechnologyBase(BaseModel):
    name: str

class TechnologyResponse(TechnologyBase):
    id: uuid.UUID
    model_config = ConfigDict(from_attributes=True)

# --- Nested Startup Components ---

class StartupFounderBase(BaseModel):
    name: str
    role: Optional[str] = None
    department: Optional[str] = None
    is_alumni: bool = False
    graduation_year: Optional[int] = None
    linkedin_url: Optional[str] = None

class StartupFounderResponse(StartupFounderBase):
    id: uuid.UUID
    model_config = ConfigDict(from_attributes=True)

class StartupAwardBase(BaseModel):
    title: str
    awarded_by: Optional[str] = None
    date_received: Optional[datetime] = None
    description: Optional[str] = None

class StartupAwardResponse(StartupAwardBase):
    id: uuid.UUID
    model_config = ConfigDict(from_attributes=True)

class StartupFundingBase(BaseModel):
    funding_round: str
    amount: Optional[str] = None
    investors: Optional[str] = None
    date_received: Optional[datetime] = None

class StartupFundingResponse(StartupFundingBase):
    id: uuid.UUID
    model_config = ConfigDict(from_attributes=True)

class StartupPressLinkBase(BaseModel):
    title: str
    url: str
    publisher: Optional[str] = None
    date_published: Optional[datetime] = None

class StartupPressLinkResponse(StartupPressLinkBase):
    id: uuid.UUID
    model_config = ConfigDict(from_attributes=True)

class StartupGalleryImageBase(BaseModel):
    image_url: str
    storage_path: str
    thumbnail_url: Optional[str] = None
    alt_text: Optional[str] = None
    caption: Optional[str] = None
    display_order: int = 0
    is_published: bool = False

class StartupGalleryImageResponse(StartupGalleryImageBase):
    id: uuid.UUID
    startup_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- Main Startup Schema ---

class StartupBase(BaseModel):
    name: str = Field(..., max_length=255)
    slug: str = Field(..., max_length=255)
    tagline: Optional[str] = Field(None, max_length=120)
    logo_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    
    short_description: str = Field(..., max_length=300)
    full_description: str
    
    stage: StartupStage = StartupStage.IDEA
    status: StartupStatus = StartupStatus.ACTIVE
    registration_status: Optional[StartupRegistrationStatus] = None
    industry: Optional[str] = None
    founded_year: Optional[int] = None
    team_size: Optional[int] = None
    
    business_model: Optional[str] = None
    problem_statement: Optional[str] = None
    solution: Optional[str] = None
    target_market: Optional[str] = None
    
    email: Optional[str] = None
    phone: Optional[str] = None
    website_url: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    instagram_url: Optional[str] = None
    demo_video_url: Optional[str] = None
    pitch_deck_url: Optional[str] = None
    youtube_demo_url: Optional[str] = None
    
    incubator: Optional[str] = None
    clients: Optional[str] = None
    patents: Optional[str] = None
    
    is_published: bool = False
    is_featured: bool = False
    verification_status: str = "PENDING"
    display_order: int = 0

class StartupCreate(StartupBase):
    internal_notes: Optional[str] = None
    batch_id: Optional[uuid.UUID] = None
    assigned_mentor_id: Optional[uuid.UUID] = None
    
    # We accept lists of nested objects for creation
    founders: List[StartupFounderBase] = []
    awards: List[StartupAwardBase] = []
    funding: List[StartupFundingBase] = []
    press_links: List[StartupPressLinkBase] = []
    technology_ids: List[uuid.UUID] = []

class StartupUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    slug: Optional[str] = Field(None, max_length=255)
    tagline: Optional[str] = Field(None, max_length=120)
    logo_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    
    short_description: Optional[str] = Field(None, max_length=300)
    full_description: Optional[str] = None
    
    stage: Optional[StartupStage] = None
    status: Optional[StartupStatus] = None
    registration_status: Optional[StartupRegistrationStatus] = None
    industry: Optional[str] = None
    founded_year: Optional[int] = None
    team_size: Optional[int] = None
    
    business_model: Optional[str] = None
    problem_statement: Optional[str] = None
    solution: Optional[str] = None
    target_market: Optional[str] = None
    
    email: Optional[str] = None
    phone: Optional[str] = None
    website_url: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    instagram_url: Optional[str] = None
    demo_video_url: Optional[str] = None
    pitch_deck_url: Optional[str] = None
    youtube_demo_url: Optional[str] = None
    
    incubator: Optional[str] = None
    clients: Optional[str] = None
    patents: Optional[str] = None
    
    is_published: Optional[bool] = None
    is_featured: Optional[bool] = None
    verification_status: Optional[str] = None
    display_order: Optional[int] = None
    
    internal_notes: Optional[str] = None
    batch_id: Optional[uuid.UUID] = None
    assigned_mentor_id: Optional[uuid.UUID] = None
    
    # For updates, we can replace the whole lists
    founders: Optional[List[StartupFounderBase]] = None
    awards: Optional[List[StartupAwardBase]] = None
    funding: Optional[List[StartupFundingBase]] = None
    press_links: Optional[List[StartupPressLinkBase]] = None
    technology_ids: Optional[List[uuid.UUID]] = None

# Public response (excludes internal notes and approval date)
class StartupPublicResponse(StartupBase):
    id: uuid.UUID
    
    batch: Optional[BatchResponse] = None
    founders: List[StartupFounderResponse] = []
    gallery_images: List[StartupGalleryImageResponse] = []
    awards: List[StartupAwardResponse] = []
    funding: List[StartupFundingResponse] = []
    press_links: List[StartupPressLinkResponse] = []
    technologies: List[TechnologyResponse] = []
    
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Admin response (includes everything)
class StartupAdminResponse(StartupPublicResponse):
    internal_notes: Optional[str] = None
    batch_id: Optional[uuid.UUID] = None
    assigned_mentor_id: Optional[uuid.UUID] = None
    created_by: Optional[uuid.UUID] = None
    approval_date: Optional[datetime] = None
