import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, ConfigDict

from app.models.enums import Role, EventStatus

# Base config for all schemas
class SchemaBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

# -----------------
# Users
# -----------------
class UserBase(SchemaBase):
    email: EmailStr
    role: Role = Role.ADMIN

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

# -----------------
# Events
# -----------------
class EventBase(SchemaBase):
    title: str
    description: str
    banner_url: Optional[str] = None
    registration_link: Optional[str] = None
    status: EventStatus = EventStatus.DRAFT
    registration_deadline: Optional[datetime] = None
    max_participants: Optional[int] = None
    
    # Google Forms Integration
    google_form_enabled: bool = False
    google_form_url: Optional[str] = None
    google_form_id: Optional[str] = None
    google_form_response_url: Optional[str] = None
    field_mapping: Optional[dict] = None
    sync_to_database: bool = True
    auto_detect_fields: bool = True
    
    custom_fields: Optional[List[dict]] = None

class EventCreate(EventBase):
    pass

class EventUpdate(SchemaBase):
    title: Optional[str] = None
    description: Optional[str] = None
    banner_url: Optional[str] = None
    registration_link: Optional[str] = None
    status: Optional[EventStatus] = None
    registration_deadline: Optional[datetime] = None
    max_participants: Optional[int] = None
    
    google_form_enabled: Optional[bool] = None
    google_form_url: Optional[str] = None
    google_form_id: Optional[str] = None
    google_form_response_url: Optional[str] = None
    field_mapping: Optional[dict] = None
    sync_to_database: Optional[bool] = None
    auto_detect_fields: Optional[bool] = None
    custom_fields: Optional[List[dict]] = None

class EventResponse(EventBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    registrations_count: int = 0

# -----------------
# Registrations
# -----------------
class RegistrationBase(SchemaBase):
    event_id: Optional[uuid.UUID] = None
    name: str
    email: EmailStr
    phone: str
    gender: Optional[str] = None
    year: Optional[str] = None
    department: Optional[str] = None
    has_laptop: Optional[bool] = None
    is_iedc_member: Optional[bool] = None
    custom_answers: Optional[dict] = None

class RegistrationCreate(RegistrationBase):
    pass

class RegistrationResponse(RegistrationBase):
    id: uuid.UUID
    created_at: datetime

# -----------------
# Team Members
# -----------------
class TeamMemberBase(SchemaBase):
    name: str
    position: str
    image_url: Optional[str] = None
    meta: Optional[str] = None
    email: Optional[str] = None
    is_lead: bool = False
    category: Optional[str] = "Core Team"

class TeamMemberCreate(TeamMemberBase):
    pass

class TeamMemberUpdate(SchemaBase):
    name: Optional[str] = None
    position: Optional[str] = None
    image_url: Optional[str] = None
    meta: Optional[str] = None
    email: Optional[str] = None
    is_lead: Optional[bool] = None
    category: Optional[str] = None

class TeamMemberResponse(TeamMemberBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

# -----------------
# Announcements
# -----------------
class AnnouncementBase(SchemaBase):
    title: str
    content: str
    is_pinned: bool = False

class AnnouncementCreate(AnnouncementBase):
    pass

class AnnouncementUpdate(SchemaBase):
    title: Optional[str] = None
    content: Optional[str] = None
    is_pinned: Optional[bool] = None

class AnnouncementResponse(AnnouncementBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

# -----------------
# Gallery
# -----------------
class GalleryBase(SchemaBase):
    image_url: str
    event_id: Optional[uuid.UUID] = None

class GalleryCreate(GalleryBase):
    pass

class GalleryResponse(GalleryBase):
    id: uuid.UUID
    created_at: datetime

# -----------------
# Contact Messages
# -----------------
class ContactMessageBase(BaseModel):
    name: str
    email: str
    message: str

class ContactMessageCreate(ContactMessageBase):
    pass

class ContactMessageResponse(ContactMessageBase):
    id: uuid.UUID
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- Podcast Schemas ---

class PodcastBase(BaseModel):
    title: str
    description: str
    date_str: str
    video_url: Optional[str] = None
    image_url: Optional[str] = None
    is_active: bool = False

class PodcastCreate(PodcastBase):
    pass

class PodcastUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date_str: Optional[str] = None
    video_url: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None

class PodcastResponse(PodcastBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Partner Schemas ---

class PartnerBase(BaseModel):
    name: str
    image_url: Optional[str] = None
    sort_order: int = 0

class PartnerCreate(PartnerBase):
    pass

class PartnerUpdate(BaseModel):
    name: Optional[str] = None
    image_url: Optional[str] = None
    sort_order: Optional[int] = None

class PartnerResponse(PartnerBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# -----------------
# Tokens
# -----------------
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[Role] = None
