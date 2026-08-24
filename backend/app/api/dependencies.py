import uuid
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
from app.models.models import User, TokenBlocklist
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
            token, settings.SECRET_KEY, algorithms=["HS256"]
        )
        jti = payload.get("jti")
        token_data = TokenData(email=payload.get("sub"), role=payload.get("role"))
        if token_data.email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
            
        # Check blocklist
        if jti:
            blocked_token = await db.execute(select(TokenBlocklist).where(TokenBlocklist.jti == jti))
            if blocked_token.scalars().first():
                raise HTTPException(status_code=401, detail="Token has been revoked")
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
            token, settings.SECRET_KEY, algorithms=["HS256"]
        )
        jti = payload.get("jti")
        token_data = TokenData(email=payload.get("sub"), role=payload.get("role"))
        if token_data.email is None:
            return None
            
        if jti:
            blocked_token = await db.execute(select(TokenBlocklist).where(TokenBlocklist.jti == jti))
            if blocked_token.scalars().first():
                return None
    except (PyJWTError, ValidationError):
        return None
        
    result = await db.execute(select(User).where(User.email == token_data.email, User.deleted_at.is_(None)))
    return result.scalars().first()
