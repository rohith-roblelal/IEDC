import uuid
from datetime import datetime
from typing import Optional, List, Generic, TypeVar
from pydantic import BaseModel, EmailStr, ConfigDict, Field

from app.models.enums import Role, TeamCategory

T = TypeVar('T')

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int
    has_next: bool

# Base config for all schemas
class SchemaBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

# -----------------
# Users
# -----------------
class UserBase(SchemaBase):
    email: EmailStr
    role: Role = Role.SUPER_ADMIN

from pydantic import BaseModel, EmailStr, ConfigDict, Field, field_validator
import re

class UserCreate(UserBase):
    password: str = Field(
        ..., 
        min_length=8,
        description="Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character."
    )

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if not re.match(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$', v):
            raise ValueError("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.")
        return v

class UserResponse(UserBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

# -----------------
# Events
# -----------------
class EventBase(SchemaBase):
    title: str
    short_description: Optional[str] = None
    description: str
    category: Optional[str] = None
    venue: Optional[str] = None
    start_datetime: Optional[datetime] = None
    end_datetime: Optional[datetime] = None
    is_published: bool = False
    
    banner_url: Optional[str] = None
    registration_link: Optional[str] = None
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
    slug: Optional[str] = None

class EventUpdate(SchemaBase):
    slug: Optional[str] = None
    title: Optional[str] = None
    short_description: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    venue: Optional[str] = None
    start_datetime: Optional[datetime] = None
    end_datetime: Optional[datetime] = None
    is_published: Optional[bool] = None
    
    banner_url: Optional[str] = None
    registration_link: Optional[str] = None
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
    slug: str
    created_at: datetime
    updated_at: datetime
    created_by: Optional[uuid.UUID] = None
    computed_status: str
    status: Optional[str] = None
    registrations_count: int = 0

# -----------------
# Registrations
# -----------------
class RegistrationBase(SchemaBase):
    event_id: Optional[uuid.UUID] = None
    name: str = Field(..., max_length=100)
    email: EmailStr
    phone: str = Field(..., max_length=20)
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
    role_title: str
    category: TeamCategory
    department: Optional[str] = None
    year: Optional[str] = None
    photo_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    instagram_url: Optional[str] = None
    email: Optional[EmailStr] = None
    display_order: int = 0
    is_published: bool = True

class TeamMemberCreate(TeamMemberBase):
    pass

class TeamMemberUpdate(SchemaBase):
    name: Optional[str] = None
    role_title: Optional[str] = None
    category: Optional[TeamCategory] = None
    department: Optional[str] = None
    year: Optional[str] = None
    photo_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    instagram_url: Optional[str] = None
    email: Optional[EmailStr] = None
    display_order: Optional[int] = None
    is_published: Optional[bool] = None

class TeamMemberResponse(TeamMemberBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

# -----------------
# Announcements
# -----------------
class AnnouncementBase(SchemaBase):
    title: str = Field(..., max_length=255)
    content: str
    is_pinned: bool = False
    is_published: bool = False
    expires_at: Optional[datetime] = None

class AnnouncementCreate(AnnouncementBase):
    slug: Optional[str] = Field(None, max_length=255)

class AnnouncementUpdate(SchemaBase):
    title: Optional[str] = Field(None, max_length=255)
    slug: Optional[str] = Field(None, max_length=255)
    content: Optional[str] = None
    is_pinned: Optional[bool] = None
    is_published: Optional[bool] = None
    expires_at: Optional[datetime] = None

class AnnouncementPublish(SchemaBase):
    is_published: bool

class AnnouncementResponse(AnnouncementBase):
    id: uuid.UUID
    slug: str
    created_by: Optional[uuid.UUID] = None
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
    name: str = Field(..., max_length=100)
    email: EmailStr
    subject: Optional[str] = Field(None, max_length=255)
    message: str = Field(..., max_length=2000)

class ContactMessageCreate(ContactMessageBase):
    pass

class ContactMessageResponse(ContactMessageBase):
    id: uuid.UUID
    is_read: bool
    is_archived: bool = False
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

# -----------------
# Password Reset
# -----------------
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(
        ..., 
        min_length=8,
        description="Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character."
    )

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if not re.match(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$', v):
            raise ValueError("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.")
        return v
