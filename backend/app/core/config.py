from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyHttpUrl, EmailStr, validator
from typing import List, Optional, Union

class Settings(BaseSettings):
    PROJECT_NAME: str = "IEDC SNMIMT Platform"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # CORS
    FRONTEND_URLS: str = "http://localhost:3000,http://127.0.0.1:3000"
    
    # Database
    DATABASE_URL: str

    # Super Admin Init
    FIRST_SUPERADMIN_PASSWORD: str

    # Supabase Storage
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str
    SUPABASE_BUCKET: str = "IEDC gallary"

    # Email Configuration (Resend)
    RESEND_API_KEY: str
    EMAIL_FROM: str = "IEDC SNMIMT <noreply@iedcsnmimt.com>"
    EMAIL_FROM_NAME: str = "IEDC SNMIMT"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

settings = Settings()
