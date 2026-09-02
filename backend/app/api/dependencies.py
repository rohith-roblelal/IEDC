import uuid
from datetime import datetime, timezone
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
import jwt
from jwt.exceptions import PyJWTError
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from app.core.config import settings
from app.database.session import get_db
from app.models.models import User, TokenBlocklist, UserSession
from app.models.enums import Role
from app.schemas.schemas import TokenData

class OAuth2PasswordBearerWithCookie(OAuth2PasswordBearer):
    async def __call__(self, request: Request) -> Optional[str]:
        authorization: Optional[str] = request.headers.get("Authorization")
        if not authorization:
            authorization = request.cookies.get("access_token")
            
        if not authorization:
            if self.auto_error:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Not authenticated",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            else:
                return None
                
        # If the authorization came from a cookie and doesn't have Bearer, add it
        if not authorization.startswith("Bearer ") and not request.headers.get("Authorization"):
            authorization = f"Bearer {authorization}"
                
        scheme, _, param = authorization.partition(" ")
        if not authorization.startswith("Bearer "):
            if self.auto_error:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid authentication credentials",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            else:
                return None
        return param

oauth2_scheme = OAuth2PasswordBearerWithCookie(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

async def get_current_user(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
            issuer=settings.JWT_ISSUER,
            audience=settings.JWT_AUDIENCE,
            options={"require": ["exp", "sub", "role", "jti", "iat", "nbf"]},
        )
        jti = payload.get("jti")
        session_id = payload.get("sid")
        token_data = TokenData(email=payload.get("sub"), role=payload.get("role"))
        if token_data.email is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        # Check blocklist
        if jti:
            blocked_token = await db.execute(select(TokenBlocklist).where(TokenBlocklist.jti == jti))
            if blocked_token.scalars().first():
                raise HTTPException(status_code=401, detail="Token has been revoked")

        if session_id:
            try:
                session_uuid = uuid.UUID(str(session_id))
            except (ValueError, TypeError):
                raise HTTPException(status_code=401, detail="Invalid session token")

            user_lookup = await db.execute(select(User).where(User.email == token_data.email, User.deleted_at.is_(None)))
            user = user_lookup.scalars().first()
            if user is None:
                raise HTTPException(status_code=401, detail="User not found")

            session_result = await db.execute(
                select(UserSession).where(
                    UserSession.id == session_uuid,
                    UserSession.user_id == user.id,
                    UserSession.is_active.is_(True),
                    UserSession.revoked_at.is_(None),
                    UserSession.expires_at > datetime.now(timezone.utc),
                )
            )
            session = session_result.scalars().first()
            if session is None:
                raise HTTPException(status_code=401, detail="Session has been revoked or expired")
    except (PyJWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    result = await db.execute(select(User).where(User.email == token_data.email, User.deleted_at.is_(None)))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

async def get_current_super_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    if current_user.role != Role.SUPER_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="The user doesn't have enough privileges"
        )
    return current_user

oauth2_scheme_optional = OAuth2PasswordBearerWithCookie(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    auto_error=False
)

async def get_optional_current_user(
    db: AsyncSession = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme_optional)
) -> Optional[User]:
    if not token:
        return None
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
            issuer=settings.JWT_ISSUER,
            audience=settings.JWT_AUDIENCE,
            options={"require": ["exp", "sub", "role", "jti", "iat", "nbf"]},
        )
        jti = payload.get("jti")
        session_id = payload.get("sid")
        token_data = TokenData(email=payload.get("sub"), role=payload.get("role"))
        if token_data.email is None:
            return None

        if jti:
            blocked_token = await db.execute(select(TokenBlocklist).where(TokenBlocklist.jti == jti))
            if blocked_token.scalars().first():
                return None

        if session_id:
            try:
                session_uuid = uuid.UUID(str(session_id))
            except (ValueError, TypeError):
                return None

            user_lookup = await db.execute(select(User).where(User.email == token_data.email, User.deleted_at.is_(None)))
            user = user_lookup.scalars().first()
            if user is None:
                return None

            session_result = await db.execute(
                select(UserSession).where(
                    UserSession.id == session_uuid,
                    UserSession.user_id == user.id,
                    UserSession.is_active.is_(True),
                    UserSession.revoked_at.is_(None),
                    UserSession.expires_at > datetime.now(timezone.utc),
                )
            )
            if session_result.scalars().first() is None:
                return None
    except (PyJWTError, ValidationError):
        return None
        
    result = await db.execute(select(User).where(User.email == token_data.email, User.deleted_at.is_(None)))
    return result.scalars().first()
