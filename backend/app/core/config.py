from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator, model_validator, ValidationInfo
from typing import Optional, Literal
from urllib.parse import urlparse

class Settings(BaseSettings):
    # Application Base
    ENVIRONMENT: Literal["development", "testing", "test", "production"] = "development"
    PROJECT_NAME: str = "IEDC SNMIMT Platform"
    API_V1_STR: str = "/api/v1"
    
    # Observability
    SENTRY_DSN: Optional[str] = None
    
    # Security / JWT
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 8  # 8 hours — reduce further in high-security environments
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    REFRESH_TOKEN_COOKIE_NAME: str = "refresh_token"
    
    # CORS
    FRONTEND_URLS: str = "http://localhost:3000,http://127.0.0.1:3000"
    
    # Database
    DATABASE_URL: str

    # Proxies & Rate Limiting
    TRUSTED_PROXIES: str = "127.0.0.1,::1"

    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    REDIS_MAX_CONNECTIONS: int = 10
    REDIS_SOCKET_TIMEOUT: int = 5
    REDIS_HEALTH_CHECK_INTERVAL: int = 30

    # JWT / Sessions
    JWT_ALGORITHM: Literal["HS256"] = "HS256"
    JWT_ISSUER: str = "iedc-snmimt"
    JWT_AUDIENCE: Optional[str] = None

    # Super Admin Init
    FIRST_SUPERADMIN_PASSWORD: str

    # Supabase Storage
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str
    SUPABASE_BUCKET: str = "IEDC gallery"
    MAX_UPLOAD_SIZE_MB: int = 5

    # Email
    EMAIL_FROM: str = "IEDC SNMIMT <noreply@iedcsnmimt.com>"
    EMAIL_FROM_NAME: str = "IEDC SNMIMT"
    RESEND_API_KEY: Optional[str] = None
    
    # Observability
    TURNSTILE_SECRET_KEY: Optional[str] = None
    OTEL_EXPORTER_OTLP_ENDPOINT: Optional[str] = None
    
    # Optional Debug settings (must be False in production)
    DEBUG: bool = False
    RELOAD: bool = False
    
    # Metrics
    METRICS_BEARER_TOKEN: Optional[str] = None
    
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, v: str, info: ValidationInfo) -> str:
        env = info.data.get("ENVIRONMENT", "development")
        if env == "production":
            if len(v) < 64:
                raise ValueError("SECRET_KEY must be at least 64 characters long in production.")
            weak_keys = ["changeme", "password", "secret", "12345678901234567890", "placeholder"]
            if any(weak in v.lower() for weak in weak_keys) or len(set(v)) < 10:
                raise ValueError("SECRET_KEY is too weak or uses a placeholder in production.")
        elif env != "production" and len(v) < 32:
             raise ValueError("SECRET_KEY must be at least 32 characters long.")
        return v
        
    @field_validator("DATABASE_URL")
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        if not v.startswith("postgres"):
            raise ValueError("DATABASE_URL must start with 'postgres' (e.g. postgresql:// or postgresql+asyncpg://)")
        return v
        
    @field_validator("SUPABASE_URL")
    @classmethod
    def validate_supabase_url(cls, v: str, info: ValidationInfo) -> str:
        env = info.data.get("ENVIRONMENT", "development")
        parsed = urlparse(v)
        if env == "production" and parsed.scheme != "https":
             raise ValueError("SUPABASE_URL must be an HTTPS URL in production.")
        if parsed.scheme not in ["http", "https"]:
             raise ValueError("SUPABASE_URL must be a valid HTTP or HTTPS URL.")
        return v
        
    @field_validator("FRONTEND_URLS")
    @classmethod
    def validate_frontend_urls(cls, v: str, info: ValidationInfo) -> str:
        env = info.data.get("ENVIRONMENT", "development")
        urls = [u.strip() for u in v.split(",") if u.strip()]
        if not urls:
             raise ValueError("FRONTEND_URLS cannot be empty.")
        
        for u in urls:
             parsed = urlparse(u)
             if parsed.scheme not in ["http", "https"]:
                 raise ValueError(f"Invalid FRONTEND_URL scheme in '{u}'.")
             if env == "production" and parsed.scheme != "https":
                 if parsed.hostname not in ["localhost", "127.0.0.1"]:
                     raise ValueError(f"Insecure HTTP FRONTEND_URL '{u}' is not allowed in production.")
        return v

    @model_validator(mode="after")
    def validate_production_settings(self) -> "Settings":
        if self.ENVIRONMENT == "production":
            if self.DEBUG or self.RELOAD:
                 raise ValueError("DEBUG and RELOAD must be False in production.")
            if self.MAX_UPLOAD_SIZE_MB <= 0:
                 raise ValueError("MAX_UPLOAD_SIZE_MB must be greater than 0.")
            if self.ACCESS_TOKEN_EXPIRE_MINUTES <= 0:
                 raise ValueError("ACCESS_TOKEN_EXPIRE_MINUTES must be greater than 0.")
            if not self.RESEND_API_KEY or not self.RESEND_API_KEY.strip():
                 raise ValueError("RESEND_API_KEY is required in production.")
            if not self.METRICS_BEARER_TOKEN or len(self.METRICS_BEARER_TOKEN) < 32:
                 raise ValueError("METRICS_BEARER_TOKEN is required and must be at least 32 characters long in production.")
        return self

settings = Settings()
