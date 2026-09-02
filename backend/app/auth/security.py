import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
import jwt
from app.core.config import settings
from typing import Any, Union, Optional
import uuid

# Use argon2 as the primary scheme for new passwords, with bcrypt as deprecated
pwd_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bool(pwd_context.verify(plain_password, hashed_password))

def get_password_hash(password: str) -> str:
    return str(pwd_context.hash(password))

def needs_password_rehash(hashed_password: str) -> bool:
    return bool(pwd_context.needs_update(hashed_password))

def generate_reset_token() -> str:
    return secrets.token_urlsafe(32)

def hash_token_for_storage(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_access_token(
    subject: str,
    role: str,
    session_id: Optional[str] = None,
    expires_delta: Optional[timedelta] = None,
) -> str:
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode = {
        "exp": expire,
        "iat": now,
        "nbf": now,
        "iss": settings.JWT_ISSUER,
        "sub": str(subject),
        "role": role,
        "jti": str(uuid.uuid4()),
    }
    if session_id:
        to_encode["sid"] = str(session_id)
    if settings.JWT_AUDIENCE:
        to_encode["aud"] = settings.JWT_AUDIENCE

    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )
    return encoded_jwt


def create_refresh_token(session_id: str, family_id: str) -> str:
    now = datetime.now(timezone.utc)
    expire = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_jti = str(uuid.uuid4())
    payload = {
        "exp": expire,
        "iat": now,
        "nbf": now,
        "iss": settings.JWT_ISSUER,
        "sub": str(session_id),
        "sid": str(session_id),
        "fam": str(family_id),
        "jti": refresh_jti,
    }
    if settings.JWT_AUDIENCE:
        payload["aud"] = settings.JWT_AUDIENCE
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def build_refresh_cookie_name() -> str:
    return settings.REFRESH_TOKEN_COOKIE_NAME
