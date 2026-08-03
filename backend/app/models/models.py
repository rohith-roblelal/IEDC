import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Enum, ForeignKey, Integer, Boolean, Text, JSON, select, func, CheckConstraint
from sqlalchemy.orm import relationship, Mapped, mapped_column, column_property
from sqlalchemy.dialects.postgresql import UUID
from app.database.session import Base
from app.models.enums import Role, EventStatus, StartupStatus, TeamCategory

def utcnow():
    return datetime.now(timezone.utc)

from sqlalchemy.orm import declared_attr

class SoftDeleteMixin:
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, index=True)

    @declared_attr
    def deleted_by(cls) -> Mapped[uuid.UUID | None]:
        return mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

class User(Base, SoftDeleteMixin):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[Role] = mapped_column(Enum(Role), default=Role.SUPER_ADMIN, nullable=False)
    is_mentor: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    
    failed_login_attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    locked_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

class TokenBlocklist(Base):
    __tablename__ = "token_blocklist"
    
    jti: Mapped[str] = mapped_column(String(36), primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    token_hash: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    is_used: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    
    user = relationship("User", backref="reset_tokens")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), index=True, nullable=True)
    action: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    resource_type: Mapped[str | None] = mapped_column(String(100), index=True, nullable=True)
    resource_id: Mapped[str | None] = mapped_column(String(255), index=True, nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(512), nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="SUCCESS")
    metadata_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)
    
    user = relationship("User", backref="audit_logs")

class Event(Base, SoftDeleteMixin):
    __tablename__ = "events"
    __table_args__ = (
        CheckConstraint(
            'end_datetime IS NULL OR start_datetime IS NULL OR end_datetime > start_datetime',
            name='check_end_datetime_after_start_datetime'
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    short_description: Mapped[str | None] = mapped_column(String(300), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str | None] = mapped_column(String(100), index=True, nullable=True)
    venue: Mapped[str | None] = mapped_column(String(255), nullable=True)
    
    start_datetime: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True, nullable=True)
    end_datetime: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    
    banner_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    registration_link: Mapped[str | None] = mapped_column(String(512), nullable=True)
    registration_deadline: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, index=True)
    max_participants: Mapped[int | None] = mapped_column(Integer, nullable=True)
    
    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), index=True, nullable=True)
    
    # Google Forms Integration
    google_form_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    google_form_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    google_form_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    google_form_response_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    field_mapping: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    sync_to_database: Mapped[bool] = mapped_column(Boolean, default=True)
    auto_detect_fields: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Custom Form Fields
    custom_fields: Mapped[list | None] = mapped_column(JSON, nullable=True)
    
    registrations = relationship("Registration", back_populates="event", cascade="all, delete-orphan", passive_deletes=True)
    creator = relationship("User", backref="created_events", foreign_keys=[created_by])

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
    
    @property
    def computed_status(self) -> str:
        if not self.is_published:
            return "DRAFT"
            
        now = datetime.now(timezone.utc)
        
        # Check if completed
        if self.end_datetime and now > self.end_datetime:
            return "COMPLETED"
            
        # Determine if registration is open
        is_registration_open = False
        if self.registration_deadline:
            if now <= self.registration_deadline:
                is_registration_open = True
        elif self.start_datetime:
            if now < self.start_datetime:
                is_registration_open = True
        else:
            is_registration_open = True

        if is_registration_open:
            return "REGISTRATION_OPEN"

        if self.start_datetime and self.end_datetime:
            if self.start_datetime <= now <= self.end_datetime:
                return "ONGOING"
        
        return "PUBLISHED"
        
    @property
    def status(self) -> str:
        return self.computed_status

class Registration(Base):
    __tablename__ = "registrations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    phone: Mapped[str] = mapped_column(String(50), nullable=False)
    
    # Extended fields
    gender: Mapped[str | None] = mapped_column(String(50), nullable=True)
    year: Mapped[str | None] = mapped_column(String(50), nullable=True)
    department: Mapped[str | None] = mapped_column(String(100), nullable=True)
    has_laptop: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    is_iedc_member: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    
    # Dynamic answers
    custom_answers: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    
    event = relationship("Event", back_populates="registrations")

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)

class TeamMember(Base, SoftDeleteMixin):
    __tablename__ = "team_members"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    role_title: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[TeamCategory] = mapped_column(Enum(TeamCategory), nullable=False)
    
    department: Mapped[str | None] = mapped_column(String(255), nullable=True)
    year: Mapped[str | None] = mapped_column(String(50), nullable=True)
    
    photo_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    linkedin_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    instagram_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    
    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

class Announcement(Base, SoftDeleteMixin):
    __tablename__ = "announcements"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    is_pinned: Mapped[bool] = mapped_column(Boolean, default=False)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, index=True)
    
    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), index=True, nullable=True)
    creator = relationship("User", backref="created_announcements", foreign_keys=[created_by])
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

class GalleryImage(Base, SoftDeleteMixin):
    __tablename__ = "gallery_images"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_url: Mapped[str] = mapped_column(String(1024), nullable=False)
    storage_path: Mapped[str] = mapped_column(String(512), nullable=False)
    alt_text: Mapped[str | None] = mapped_column(String(255), nullable=True)
    category: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    
    # Keeping event_id for backward compatibility and relationships
    event_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=True, index=True)
    
    uploaded_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    uploader = relationship("User", backref="uploaded_images", foreign_keys=[uploaded_by])
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    subject: Mapped[str | None] = mapped_column(String(255), nullable=True)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)

class Podcast(Base):
    __tablename__ = "podcasts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    date_str: Mapped[str] = mapped_column(String(100), nullable=False)
    video_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

class Partner(Base):
    __tablename__ = "partners"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    image_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

class WebsiteSettings(Base):
    __tablename__ = "website_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)

    # Branding
    site_name: Mapped[str] = mapped_column(String(255), default="IEDC SNMIMT")
    site_tagline: Mapped[str | None] = mapped_column(String(512), nullable=True)
    logo_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    favicon_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)

    # Hero / Homepage
    hero_title: Mapped[str | None] = mapped_column(String(512), nullable=True)
    hero_subtitle: Mapped[str | None] = mapped_column(Text, nullable=True)
    hero_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    hero_cta_text: Mapped[str | None] = mapped_column(String(100), nullable=True)
    hero_cta_link: Mapped[str | None] = mapped_column(String(512), nullable=True)
    hero_image_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)

    # About
    about_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    about_vision: Mapped[str | None] = mapped_column(Text, nullable=True)
    about_stats_json: Mapped[list | None] = mapped_column(JSON, nullable=True)

    # Contact Info
    contact_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    contact_phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    contact_address: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Social Media
    facebook_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    instagram_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    twitter_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    linkedin_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    youtube_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    github_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)

    # Footer
    footer_tagline: Mapped[str | None] = mapped_column(String(512), nullable=True)

    # SEO / Open Graph
    seo_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    seo_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    og_image_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)

    # Email config
    email_from_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    email_reply_to: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Flags / Future
    maintenance_mode: Mapped[bool] = mapped_column(Boolean, default=False)
    google_analytics_id: Mapped[str | None] = mapped_column(String(100), nullable=True)

    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

class Batch(Base, SoftDeleteMixin):
    __tablename__ = "batches"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0)

    startups = relationship("Startup", back_populates="batch")
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

class Technology(Base, SoftDeleteMixin):
    __tablename__ = "technologies"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

class StartupTechnology(Base):
    __tablename__ = "startup_technologies"

    startup_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("startups.id", ondelete="CASCADE"), primary_key=True)
    technology_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("technologies.id", ondelete="CASCADE"), primary_key=True)
    
class Startup(Base, SoftDeleteMixin):
    __tablename__ = "startups"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    tagline: Mapped[str | None] = mapped_column(String(120), nullable=True)
    logo_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    cover_image_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    
    short_description: Mapped[str] = mapped_column(String(300), nullable=False)
    full_description: Mapped[str] = mapped_column(Text, nullable=False)
    
    from app.models.enums import StartupStage, StartupStatus, StartupRegistrationStatus
    stage: Mapped[StartupStage] = mapped_column(Enum(StartupStage), default=StartupStage.IDEA, nullable=False)
    status: Mapped[StartupStatus] = mapped_column(Enum(StartupStatus), default=StartupStatus.ACTIVE, nullable=False)
    registration_status: Mapped[StartupRegistrationStatus | None] = mapped_column(Enum(StartupRegistrationStatus), nullable=True)
    industry: Mapped[str | None] = mapped_column(String(255), nullable=True)
    founded_year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    team_size: Mapped[int | None] = mapped_column(Integer, nullable=True)
    
    business_model: Mapped[str | None] = mapped_column(Text, nullable=True)
    problem_statement: Mapped[str | None] = mapped_column(Text, nullable=True)
    solution: Mapped[str | None] = mapped_column(Text, nullable=True)
    target_market: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    website_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    github_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    linkedin_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    instagram_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    demo_video_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    pitch_deck_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    youtube_demo_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    
    incubator: Mapped[str | None] = mapped_column(String(255), nullable=True)
    clients: Mapped[str | None] = mapped_column(Text, nullable=True)
    patents: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    is_published: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    verification_status: Mapped[str] = mapped_column(String(50), default="PENDING", nullable=False)
    internal_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    approval_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    batch_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("batches.id", ondelete="SET NULL"), nullable=True)
    assigned_mentor_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    batch = relationship("Batch", back_populates="startups")
    assigned_mentor = relationship("User", foreign_keys=[assigned_mentor_id])
    creator = relationship("User", foreign_keys=[created_by])
    
    founders = relationship("StartupFounder", back_populates="startup", cascade="all, delete-orphan", passive_deletes=True)
    gallery_images = relationship("StartupGalleryImage", back_populates="startup", cascade="all, delete-orphan", passive_deletes=True)
    awards = relationship("StartupAward", back_populates="startup", cascade="all, delete-orphan", passive_deletes=True)
    funding = relationship("StartupFunding", back_populates="startup", cascade="all, delete-orphan", passive_deletes=True)
    press_links = relationship("StartupPressLink", back_populates="startup", cascade="all, delete-orphan", passive_deletes=True)
    
    technologies = relationship("Technology", secondary="startup_technologies", lazy="selectin")

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

class StartupFounder(Base, SoftDeleteMixin):
    __tablename__ = "startup_founders"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    startup_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("startups.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str | None] = mapped_column(String(255), nullable=True)
    department: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_alumni: Mapped[bool] = mapped_column(Boolean, default=False)
    graduation_year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    linkedin_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    
    startup = relationship("Startup", back_populates="founders")
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

class StartupAward(Base, SoftDeleteMixin):
    __tablename__ = "startup_awards"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    startup_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("startups.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    awarded_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    date_received: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    startup = relationship("Startup", back_populates="awards")
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

class StartupFunding(Base, SoftDeleteMixin):
    __tablename__ = "startup_funding"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    startup_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("startups.id", ondelete="CASCADE"), nullable=False, index=True)
    funding_round: Mapped[str] = mapped_column(String(255), nullable=False)
    amount: Mapped[str | None] = mapped_column(String(255), nullable=True)
    investors: Mapped[str | None] = mapped_column(Text, nullable=True)
    date_received: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    startup = relationship("Startup", back_populates="funding")
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

class StartupPressLink(Base, SoftDeleteMixin):
    __tablename__ = "startup_press_links"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    startup_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("startups.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    url: Mapped[str] = mapped_column(String(512), nullable=False)
    publisher: Mapped[str | None] = mapped_column(String(255), nullable=True)
    date_published: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    startup = relationship("Startup", back_populates="press_links")
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

class StartupGalleryImage(Base, SoftDeleteMixin):
    __tablename__ = "startup_gallery_images"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    startup_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("startups.id", ondelete="CASCADE"), nullable=False, index=True)
    image_url: Mapped[str] = mapped_column(String(1024), nullable=False)
    storage_path: Mapped[str] = mapped_column(String(512), nullable=False)
    thumbnail_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    alt_text: Mapped[str | None] = mapped_column(String(255), nullable=True)
    caption: Mapped[str | None] = mapped_column(String(255), nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False, index=True)

    startup = relationship("Startup", back_populates="gallery_images")
    
    uploaded_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

Event.registrations_count = column_property(
    select(func.count(Registration.id))
    .where(Registration.event_id == Event.id)
    .correlate_except(Registration)
    .scalar_subquery()
)
