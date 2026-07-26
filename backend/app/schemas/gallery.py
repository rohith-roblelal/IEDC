from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime
from uuid import UUID

class GalleryImageBase(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    alt_text: Optional[str] = Field(None, max_length=255)
    category: Optional[str] = Field(None, max_length=100)
    is_published: bool = False
    event_id: Optional[UUID] = None

class GalleryImageCreate(GalleryImageBase):
    image_url: str
    storage_path: str

class GalleryImageUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    alt_text: Optional[str] = Field(None, max_length=255)
    category: Optional[str] = Field(None, max_length=100)
    is_published: Optional[bool] = None
    event_id: Optional[UUID] = None

class GalleryImageResponse(GalleryImageBase):
    id: UUID
    image_url: str
    storage_path: str
    uploaded_by: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
