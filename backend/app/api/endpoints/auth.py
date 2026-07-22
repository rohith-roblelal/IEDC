from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any

from app.database.session import get_db
from app.auth.security import verify_password, create_access_token
from app.repositories.user import UserRepository
from app.schemas.schemas import Token

router = APIRouter()

@router.post("/login", response_model=Token)
async def login_access_token(
    response: Response, db: AsyncSession = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    user_repo = UserRepository(db)
    user = await user_repo.get_by_email(email=form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = create_access_token(
        subject=user.email, role=user.role.value
    )
    
    # Set HttpOnly cookie (secure=False for local development over HTTP)
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=1800, # 30 mins
    )
    
    return {"access_token": access_token, "token_type": "bearer"}
